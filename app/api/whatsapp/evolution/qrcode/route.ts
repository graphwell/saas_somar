import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const EVOLUTION_URL = process.env.EVOLUTION_API_URL || 'http://evolution.somar.ia.br';
const EVOLUTION_KEY = process.env.EVOLUTION_API_KEY || 'sua-chave-aqui-mude-isso';

// GET /api/whatsapp/evolution/qrcode?instance=nome-da-instancia
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const instance = searchParams.get('instance');

  if (!instance) {
    return NextResponse.json({ error: 'Parâmetro "instance" obrigatório' }, { status: 400 });
  }

  try {
    const res = await fetch(`${EVOLUTION_URL}/instance/connect/${instance}`, {
      headers: { apikey: EVOLUTION_KEY },
      cache: 'no-store'
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: data.message || 'Erro ao buscar QR Code' }, { status: 400 });
    }

    return NextResponse.json({
      qrcode: data.base64 || null,
      status: data.state || 'unknown',
      pairingCode: data.pairingCode || null,
    });

  } catch (err) {
    console.error('EVOLUTION_QRCODE_ERROR:', err);
    return NextResponse.json({ error: 'Falha ao buscar QR Code' }, { status: 500 });
  }
}
