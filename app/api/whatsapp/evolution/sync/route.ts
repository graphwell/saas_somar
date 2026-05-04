import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const EVOLUTION_URL = process.env.EVOLUTION_API_URL || 'http://evolution.somar.ia.br';
const EVOLUTION_KEY = process.env.EVOLUTION_API_KEY || '';

// POST /api/whatsapp/evolution/sync
// Importa instâncias existentes na Evolution API para o banco de dados do usuário
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const userId = (session.user as any).id;

  try {
    const body = await req.json().catch(() => ({}));
    const { instanceKey } = body;

    if (!instanceKey) {
      return NextResponse.json({ error: 'instanceKey é obrigatório' }, { status: 400 });
    }

    // Verifica se a instância existe na Evolution API
    const res = await fetch(`${EVOLUTION_URL}/instance/fetchInstances`, {
      headers: { apikey: EVOLUTION_KEY },
      cache: 'no-store'
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Falha ao buscar instâncias da Evolution' }, { status: 502 });
    }

    const instances: any[] = await res.json();
    const found = instances.find((i: any) => 
      i.instance?.instanceName === instanceKey || i.name === instanceKey
    );

    if (!found) {
      return NextResponse.json({ error: `Instância "${instanceKey}" não encontrada na Evolution API` }, { status: 404 });
    }

    // Salva no banco de dados
    const saved = await prisma.whatsAppInstance.upsert({
      where: { instanceKey },
      update: { userId, status: found.instance?.state === 'open' ? 'connected' : 'disconnected' },
      create: {
        userId,
        name: instanceKey,
        provider: 'evolution',
        instanceKey,
        token: instanceKey,
        status: found.instance?.state === 'open' ? 'connected' : 'disconnected',
      }
    });

    return NextResponse.json({ success: true, instance: saved });

  } catch (err) {
    console.error('EVOLUTION_SYNC_ERROR:', err);
    return NextResponse.json({ error: 'Erro interno ao sincronizar instância' }, { status: 500 });
  }
}
