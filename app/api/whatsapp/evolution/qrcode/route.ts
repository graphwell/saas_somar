import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const EVOLUTION_URL = process.env.EVOLUTION_API_URL || 'http://evolution.somar.ia.br';
const EVOLUTION_KEY = process.env.EVOLUTION_API_KEY || '';

// GET /api/whatsapp/evolution/qrcode?instance=nome-da-instancia
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const { searchParams } = new URL(req.url);
  const instance = searchParams.get('instance');

  if (!instance) {
    return NextResponse.json({ error: 'Parâmetro "instance" obrigatório' }, { status: 400 });
  }

  try {
    // Tenta conectar e gerar QR Code na Evolution API
    const res = await fetch(`${EVOLUTION_URL}/instance/connect/${instance}`, {
      headers: { apikey: EVOLUTION_KEY },
      cache: 'no-store'
    });

    const rawText = await res.text();
    console.log(`EVOLUTION_QRCODE_RAW [${instance}] status=${res.status}:`, rawText.slice(0, 500));

    let data: any = {};
    try {
      data = JSON.parse(rawText);
    } catch {
      return NextResponse.json({ 
        error: `Resposta inválida da Evolution API (status ${res.status})`,
        debug: rawText.slice(0, 200)
      }, { status: 502 });
    }

    if (!res.ok) {
      // Se a instância não existe na Evolution, tenta criá-la do zero
      if (res.status === 404 || data?.error?.includes('not found') || data?.message?.includes('not found')) {
        return NextResponse.json({ 
          error: 'Instância não encontrada na Evolution API. Clique em "Gerar QR Code" para criar.',
          needsRecreate: true
        }, { status: 404 });
      }
      return NextResponse.json({ 
        error: data?.message || data?.error || `Erro ${res.status} da Evolution API`
      }, { status: 400 });
    }

    // A Evolution API v2 pode retornar o QR em diferentes formatos:
    // { base64: "data:image/png;base64,..." } ou { qrcode: { base64: "..." } }
    const qrcode = 
      data?.base64 || 
      data?.qrcode?.base64 || 
      data?.code ||
      null;

    const status = data?.state || data?.instance?.state || 'unknown';

    // Atualiza status da instância no banco
    if (status === 'open') {
      await prisma.whatsAppInstance.updateMany({
        where: { instanceKey: instance, userId },
        data: { status: 'connected' }
      });
    }

    return NextResponse.json({
      qrcode,
      status,
      pairingCode: data?.pairingCode || null,
      // debug info para diagnóstico
      _debug: process.env.NODE_ENV === 'development' ? { raw: data } : undefined
    });

  } catch (err: any) {
    console.error('EVOLUTION_QRCODE_ERROR:', err);
    return NextResponse.json({ 
      error: `Falha ao conectar com a Evolution API: ${err.message}` 
    }, { status: 500 });
  }
}
