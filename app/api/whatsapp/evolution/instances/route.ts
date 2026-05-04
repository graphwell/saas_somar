import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const EVOLUTION_URL = process.env.EVOLUTION_API_URL || 'https://evolution.somar.ia.br';
const EVOLUTION_KEY = process.env.EVOLUTION_API_KEY || 'sua-chave-aqui-mude-isso';

// GET /api/whatsapp/evolution/instances — lista as instâncias do usuário
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const res = await fetch(`${EVOLUTION_URL}/instance/fetchInstances`, {
      headers: { apikey: EVOLUTION_KEY },
      cache: 'no-store'
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('EVOLUTION_FETCH_ERROR:', text);
      return NextResponse.json({ error: 'Erro ao buscar instâncias' }, { status: 502 });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('EVOLUTION_INSTANCES_ERROR:', err);
    return NextResponse.json({ error: 'Falha ao conectar com Evolution API' }, { status: 500 });
  }
}

// POST /api/whatsapp/evolution/instances — cria uma nova instância
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const userId = (session.user as any).id;

  try {
    const { instanceName } = await req.json();

    if (!instanceName || instanceName.trim().length < 3) {
      return NextResponse.json({ error: 'Nome da instância inválido (mínimo 3 caracteres)' }, { status: 400 });
    }

    // Sanitiza o nome: apenas letras, números, hífens e underscores
    const safeName = `${instanceName.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-')}-${userId.slice(0, 8)}`;

    const protocol = req.headers.get('x-forwarded-proto') || 'https';
    const host = req.headers.get('host');
    const webhookUrl = `${protocol}://${host}/api/whatsapp/webhook/evolution`;

    const body = {
      instanceName: safeName,
      token: safeName, // o token é o próprio nome da instância na Evolution v2
      integration: 'WHATSAPP-BAILEYS',
      webhook: {
        enabled: true,
        url: webhookUrl,
        events: ['MESSAGES_UPSERT', 'CONNECTION_UPDATE', 'QRCODE_UPDATED'],
        byEvents: false,
        base64: false
      },
      settings: {
        rejectCall: false,
        msgCall: '',
        groupsIgnore: true,
        alwaysOnline: true,
        readMessages: true,
        readStatus: false,
        syncFullHistory: false
      }
    };

    const res = await fetch(`${EVOLUTION_URL}/instance/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: EVOLUTION_KEY
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('EVOLUTION_CREATE_ERROR:', data);
      return NextResponse.json({ error: data.message || 'Erro ao criar instância' }, { status: 400 });
    }

    // Salvar a instância no banco de dados
    const { prisma } = await import('@/lib/prisma');
    await prisma.whatsAppInstance.upsert({
      where: { instanceKey: safeName },
      update: { userId, status: 'disconnected' },
      create: {
        userId,
        name: instanceName.trim(),
        provider: 'evolution',
        instanceKey: safeName,
        token: safeName,
        status: 'disconnected',
      }
    });

    return NextResponse.json({
      instanceName: safeName,
      status: data.instance?.state || 'created',
      qrcode: data.qrcode?.base64 || null,
    });

  } catch (err) {
    console.error('EVOLUTION_CREATE_INSTANCE_ERROR:', err);
    return NextResponse.json({ error: 'Erro interno ao criar instância' }, { status: 500 });
  }
}
