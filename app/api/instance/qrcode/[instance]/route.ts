import { NextResponse } from 'next/server';

const EVOLUTION_URL = (process.env.EVOLUTION_API_URL || 'https://evolution.somar.ia.br').replace(/\/$/, '');
const EVOLUTION_KEY = process.env.EVOLUTION_API_KEY || '';

export async function GET(
  _: Request,
  { params }: { params: { instance: string } }
) {
  try {
    const res = await fetch(
      `${EVOLUTION_URL}/instance/connect/${params.instance}`,
      { headers: { apikey: EVOLUTION_KEY }, cache: 'no-store' }
    );
    
    if (!res.ok) {
      return NextResponse.json({ error: 'Falha ao buscar QR Code' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json({
      qrCode: data.base64 ?? null,
      status: data.instance?.state ?? null,
      message: data.message ?? null
    });
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
