import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const EVOLUTION_URL = process.env.EVOLUTION_API_URL || 'http://evolution.somar.ia.br';
const EVOLUTION_KEY = process.env.EVOLUTION_API_KEY || '';

// Aguarda N milissegundos
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

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
    // Passo 1: Reiniciar a instância para forçar a geração do QR Code
    console.log(`QRCODE: Reiniciando instância ${instance}...`);
    const restartRes = await fetch(`${EVOLUTION_URL}/instance/restart/${instance}`, {
      method: 'PUT',
      headers: { apikey: EVOLUTION_KEY },
      cache: 'no-store'
    });
    
    if (!restartRes.ok) {
      // Se a instância não existe na Evolution, informa para recriar
      if (restartRes.status === 404) {
        return NextResponse.json({ 
          error: 'Instância não encontrada na Evolution API.',
          needsRecreate: true
        }, { status: 404 });
      }
      console.warn(`QRCODE: Restart retornou ${restartRes.status} para ${instance}`);
    }

    // Passo 2: Aguardar 3 segundos para o QR ser gerado
    await sleep(3000);

    // Passo 3: Buscar o QR Code gerado
    console.log(`QRCODE: Buscando QR de ${instance}...`);
    const connectRes = await fetch(`${EVOLUTION_URL}/instance/connect/${instance}`, {
      headers: { apikey: EVOLUTION_KEY },
      cache: 'no-store'
    });

    const rawText = await connectRes.text();
    console.log(`QRCODE_RESPONSE [${instance}]:`, rawText.slice(0, 300));

    let data: any = {};
    try { data = JSON.parse(rawText); } catch {
      return NextResponse.json({ error: 'Resposta inválida da Evolution API' }, { status: 502 });
    }

    // Evolution API v2 retorna o QR em diferentes campos dependendo da versão
    const qrcode = 
      data?.base64 ||       // formato principal v2
      data?.qrcode?.base64 || // formato alternativo
      data?.code ||           // código raw
      null;

    const status = data?.state || data?.instance?.state || 'qrcode';

    // Se QR ainda não disponível após restart, retorna status para tentar de novo
    if (!qrcode) {
      return NextResponse.json({ 
        qrcode: null, 
        status: 'starting',
        message: 'Aguardando geração do QR Code...'
      });
    }

    // Atualiza status da instância no banco se conectou
    if (status === 'open') {
      await prisma.whatsAppInstance.updateMany({
        where: { instanceKey: instance, userId },
        data: { status: 'connected' }
      });
    }

    return NextResponse.json({ qrcode, status });

  } catch (err: any) {
    console.error('EVOLUTION_QRCODE_ERROR:', err);
    return NextResponse.json({ 
      error: `Falha ao conectar com a Evolution API: ${err.message}` 
    }, { status: 500 });
  }
}
