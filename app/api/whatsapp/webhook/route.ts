import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Identificar a instância que enviou a mensagem (depende do payload do provedor)
    const instanceKey = body.instanceId || body.instance;
    const phone = body.data?.from || body.from;
    const message = body.data?.body || body.body || body.text;

    if (!instanceKey || !phone || !message) {
      return NextResponse.json({ error: 'Payload incompleto' }, { status: 400 });
    }

    // Buscar no banco quem é o dono desta instância
    const instance = await prisma.whatsAppInstance.findUnique({
      where: { instanceKey },
      include: { user: { include: { subscription: true } }, agent: true }
    });

    if (!instance || !instance.user) {
      return NextResponse.json({ error: 'Instância não reconhecida' }, { status: 404 });
    }

    const agent = instance.agent;
    if (!agent) {
      return NextResponse.json({ error: 'Nenhum agente ativo para esta instância' }, { status: 404 });
    }

    // Verificar Limites (Monetização)
    const subscription = instance.user.subscription;
    if (!subscription || subscription.messagesUsed >= subscription.messagesLimit) {
        return NextResponse.json({ error: 'Limite de mensagens excedido' }, { status: 403 });
    }

    await prisma.subscription.update({
        where: { id: subscription.id },
        data: { messagesUsed: { increment: 1 } }
    });

    // Encaminhar para o n8n Master Flow
    const n8nResponse = await fetch(process.env.N8N_WEBHOOK_URL || '', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: instance.userId,
        customerPhone: phone,
        customerName: body.data?.pushName || 'Cliente',
        message: message,
        agentConfig: {
            prompt: agent.systemPrompt,
            temperature: agent.temperature,
            name: agent.name
        },
        instance: {
          instanceKey: instance.instanceKey,
          token: instance.token,
          provider: instance.provider
        }
      })
    });

    if (!n8nResponse.ok) {
       console.error('N8N_ERROR:', await n8nResponse.text());
    }

    return NextResponse.json({ success: true, routed: true });

  } catch (err) {
    console.error('WEBHOOK_ROUTER_ERROR:', err);
    return NextResponse.json({ error: 'Erro interno no roteamento' }, { status: 500 });
  }
}
