import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { WhatsAppFactory } from '@/lib/whatsapp/factory';
import { rateLimit } from '@/lib/rateLimit';

export async function POST(req: Request, { params }: { params: Promise<{ instanceId: string }> }) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  if (!rateLimit(ip, 60, 60_000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }
  try {
    const { instanceId } = await params;

    // 1. Fetch Instance and associated User and Agent
    const instance = await prisma.whatsAppInstance.findUnique({
      where: { instanceKey: instanceId },
      include: { 
        user: { 
          include: { subscription: true } 
        },
        agent: true
      }
    });

    if (!instance || !instance.user) {
      return NextResponse.json({ error: 'Instance not found or not assigned' }, { status: 404 });
    }

    const { user, agent } = instance;

    // 2. Validação de autenticação via secret do webhook
    const webhookSecret = process.env.WASENDER_WEBHOOK_SECRET;
    if (webhookSecret) {
      const requestSecret = req.headers.get('x-webhook-secret') || req.headers.get('x-hub-signature-256');
      if (!requestSecret || requestSecret !== webhookSecret) {
        console.warn(`WEBHOOK_AUTH_FAILED: instanceId=${instanceId}`);
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const body = await req.json();

    // 3. Identify agent configuration
    if (!agent) {
      return NextResponse.json({ error: 'No agent configured for this instance' }, { status: 400 });
    }
    if (!agent.isActive) {
      return NextResponse.json({ status: 'ignored', reason: 'agent_inactive' });
    }

    // 4. Normalize the webhook using the factory
    const adapter = WhatsAppFactory.getAdapter(instance.provider);
    const normalizedMsg = adapter.normalizeWebhook(body, instance.instanceKey);

    if (!normalizedMsg || normalizedMsg.tipo !== 'text') {
      return NextResponse.json({ status: 'ignored', reason: 'Not a valid incoming user text message' });
    }

    // 5. Check Message Limit (Monetization Check)
    const subscription = user.subscription;
    if (!subscription || subscription.messagesUsed >= subscription.messagesLimit) {
      return NextResponse.json({ status: 'blocked', reason: 'Message limit reached for this billing cycle' });
    }

    // Incrementa a mensagem (simples, mas deveria ser após o envio. Para MVP está ok).
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { messagesUsed: { increment: 1 } }
    });

    // 6. Check STOP / PLAY logic
    const textToLower = normalizedMsg.mensagem.toLowerCase().trim();
    const stopKeywords = ['parar', 'stop', 'atendente', 'humano', 'falar com humano'];
    
    const isStopRequested = stopKeywords.some(kw => textToLower.includes(kw));

    if (isStopRequested) {
      await adapter.sendMessage(
        normalizedMsg.telefone, 
        "Certo! O atendimento automático foi pausado. Um atendente humano falará com você em breve.", 
        instance.token, 
        instance.instanceKey
      );
      return NextResponse.json({ status: 'paused', msg: 'Stop requested' });
    }

    // 6.5. SEMANTIC CACHE CHECK (Cost Optimization)
    // Busca se essa pergunta já foi respondida recentemente
    const cachedResponse = await prisma.agentResponseCache.findFirst({
      where: {
        agentId: agent.id,
        query: {
          equals: textToLower,
          mode: 'insensitive'
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (cachedResponse) {
      // Devolve diretamente do banco de dados, sem custo de LLM
      await adapter.sendMessage(
        normalizedMsg.telefone,
        cachedResponse.response,
        instance.token,
        instance.instanceKey
      );
      console.log(`[CACHE HIT] Agent ${agent.id} answered query: ${textToLower}`);
      return NextResponse.json({ status: 'success', cached: true, msg: 'Answered from cache' });
    }

    // 7. Forward to n8n Webhook (SOMAR.IA ISOLATED FLOW)
    const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;
    
    if (!N8N_WEBHOOK_URL) {
      console.warn("N8N_WEBHOOK_URL not configured. Message skipped.");
      return NextResponse.json({ status: 'ignored', reason: 'n8n not configured' });
    }

    // Fire and forget with enhanced metadata
    fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-project-id': 'somar-ia-saas'
      },
      body: JSON.stringify({
        ...normalizedMsg,
        project: 'somar_ia_saas',
        token: instance.token,
        provider: instance.provider,
        agentConfig: {
          prompt: agent.systemPrompt,
          temperature: agent.temperature,
          name: agent.name,
          agentId: agent.id // Passado para o n8n poder salvar o cache depois
        }
      })
    }).catch(e => console.error("Error forwarding to n8n Somar flow:", e));


    return NextResponse.json({ status: 'success', forwarded: true, project: 'somar_ia_saas' });

  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
