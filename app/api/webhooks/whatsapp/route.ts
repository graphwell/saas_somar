import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkMessageLimit } from '@/lib/services/whatsapp-limit.service';

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || '';

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const providerParam = searchParams.get('provider'); // ULTRAMSG or WASENDER
    const instanceKeyParam = searchParams.get('instance');
    
    const body = await request.json();
    console.log(`[WHATSAPP_WEBHOOK] Received from ${providerParam}/${instanceKeyParam}`);

    // 1. Identifica a instância e o usuário no banco
    const instance = await prisma.whatsAppInstance.findUnique({
      where: { instanceKey: instanceKeyParam || '' },
      include: { user: true }
    });

    if (!instance || !instance.userId) {
      console.warn(`[WHATSAPP_WEBHOOK] Instância ${instanceKeyParam} não encontrada ou sem usuário.`);
      return NextResponse.json({ error: 'Instance not found' }, { status: 404 });
    }

    // 2. Extrai a mensagem e o remetente baseado no provedor
    let message = '';
    let from = '';

    if (providerParam === 'ULTRAMSG') {
      // Estrutura UltraMsg
      const data = body.data?.[0] || body;
      message = data.body || '';
      from = data.from || '';
    } else if (providerParam === 'WASENDER') {
      // Estrutura WaSender (exemplo hipotético)
      message = body.message?.text || body.body || '';
      from = body.sender?.jid || body.from || '';
    }

    if (!message || !from) {
      return NextResponse.json({ ok: true, message: 'No content to process' });
    }

    // 3. Verifica limites (Incrementa o contador)
    try {
      await checkMessageLimit(instance.userId);
    } catch (limitErr: any) {
      console.error(`[LIMIT_EXCEEDED] User ${instance.userId}: ${limitErr.message}`);
      // Opcional: Enviar mensagem de "Limite atingido" via API do provedor aqui
      return NextResponse.json({ error: limitErr.message }, { status: 403 });
    }

    // 4. Repassa para o n8n com o payload unificado
    const n8nPayload = {
      userId: instance.userId,
      provider: instance.provider,
      instanceKey: instance.instanceKey,
      apiToken: instance.token,
      message: message,
      from: from,
      timestamp: new Date().toISOString()
    };

    fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(n8nPayload)
    }).catch(err => console.error('[N8N_FORWARD_ERROR]', err));

    return NextResponse.json({ ok: true });

  } catch (error: any) {
    console.error('[WHATSAPP_WEBHOOK_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
