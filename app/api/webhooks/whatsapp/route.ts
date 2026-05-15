import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkMessageLimit } from '@/lib/services/whatsapp-limit.service';
import { rateLimit } from '@/lib/rateLimit';

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || '';

// POST /api/webhooks/whatsapp?provider=ULTRAMSG&instance=KEY
export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
  if (!rateLimit(ip, 60, 60_000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const providerParam = (searchParams.get('provider') || '').toUpperCase(); // ULTRAMSG | WASENDER
    const instanceKeyParam = searchParams.get('instance') || '';

    const body = await request.json();
    console.log(`[WEBHOOK] Received from ${providerParam}/${instanceKeyParam}`);

    // 1. Identifica instância, usuário e agente no banco
    const instance = await prisma.whatsAppInstance.findUnique({
      where: { instanceKey: instanceKeyParam },
      include: {
        user: { include: { subscription: true } },
        agent: true
      }
    });

    if (!instance || !instance.userId) {
      console.warn(`[WEBHOOK] Instância '${instanceKeyParam}' não encontrada ou sem usuário.`);
      return NextResponse.json({ ok: false, error: 'Instance not found' }, { status: 404 });
    }

    // 2. Extrai mensagem e remetente conforme o provedor
    let message = '';
    let from = '';
    let customerName = 'Cliente';

    if (providerParam === 'ULTRAMSG') {
      // Estrutura UltraMsg: body.data[0] ou direto no body
      const data = body.data?.[0] || body;
      message = data.body || '';
      from = (data.from || '').replace('@c.us', '');
      customerName = data.pushName || data.notifyName || 'Cliente';
    } else if (providerParam === 'WASENDER') {
      // Estrutura WaSender
      message = body.message?.text || body.body || '';
      from = (body.sender?.jid || body.from || '').replace('@s.whatsapp.net', '');
      customerName = body.pushName || 'Cliente';
    }

    // Comandos do DONO via mensagem enviada por ele mesmo (#parar / #iniciar)
    const isOwnerMsg = body.fromMe === true || body.key?.fromMe === true;
    if (isOwnerMsg && message) {
      const cmd = message.trim().toLowerCase();
      const STOP  = ['#parar', '#stop', '#pausar', '#desligar'];
      const START = ['#iniciar', '#start', '#ativar', '#ligar'];
      if (STOP.includes(cmd) || START.includes(cmd)) {
        const activate = START.includes(cmd);
        await prisma.agent.updateMany({ where: { userId: instance.userId }, data: { isActive: activate } });
        return NextResponse.json({ ok: true, command: activate ? 'started' : 'stopped' });
      }
    }

    // Ignora mensagens vazias ou enviadas pelo próprio número
    if (!message || !from || isOwnerMsg) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    // 3. Verifica limite de mensagens e incrementa contador
    try {
      await checkMessageLimit(instance.userId);
    } catch (limitErr: any) {
      console.warn(`[WEBHOOK] Limite atingido para userId=${instance.userId}`);
      return NextResponse.json({ ok: false, error: limitErr.message }, { status: 403 });
    }

    // 4. Verifica se há agente configurado e se está ativo
    const agent = instance.agent ?? await prisma.agent.findFirst({ where: { userId: instance.userId } });
    if (!agent) {
      console.warn(`[WEBHOOK] Nenhum agente vinculado à instância ${instanceKeyParam}`);
      return NextResponse.json({ ok: false, error: 'No agent configured' }, { status: 400 });
    }
    if (!agent.isActive) {
      return NextResponse.json({ ok: true, ignored: true, reason: 'agent_inactive' });
    }

    // 5. Repassa ao n8n com payload padronizado (inclui config do agente e token da instância)
    const n8nPayload = {
      userId: instance.userId,
      provider: instance.provider,
      instanceKey: instance.instanceKey,
      apiToken: instance.token,
      customerPhone: from,
      customerName,
      message,
      agentConfig: {
        name: agent.name,
        prompt: agent.systemPrompt,
        temperature: agent.temperature
      },
      timestamp: new Date().toISOString()
    };

    if (N8N_WEBHOOK_URL) {
      fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(n8nPayload)
      }).catch(err => console.error('[N8N_FORWARD_ERROR]', err));
    } else {
      console.warn('[WEBHOOK] N8N_WEBHOOK_URL não configurado — mensagem não repassada.');
    }

    return NextResponse.json({ ok: true, routed: true });

  } catch (error: any) {
    console.error('[WEBHOOK_ERROR]', error);
    return NextResponse.json({ ok: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
