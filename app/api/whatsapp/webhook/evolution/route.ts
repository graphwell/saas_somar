import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const N8N_WEBHOOK_URL = process.env.N8N_EVOLUTION_WEBHOOK_URL || process.env.N8N_WEBHOOK_URL || '';
const EVOLUTION_URL = process.env.EVOLUTION_API_URL || 'https://evolution.somar.ia.br';

// POST /api/whatsapp/webhook/evolution — recebe eventos da Evolution API
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Evolution API v2 — estrutura do evento de mensagem
    const event = body.event;
    if (event !== 'messages.upsert') {
      return NextResponse.json({ ignored: true, event });
    }

    const messageData = body.data;
    const instanceName: string = body.instance;

    // Ignora mensagens enviadas pela própria instância
    if (messageData?.key?.fromMe) {
      return NextResponse.json({ ignored: true, reason: 'fromMe' });
    }

    const phone = messageData?.key?.remoteJid?.replace('@s.whatsapp.net', '');
    const pushName = messageData?.pushName || 'Cliente';
    const message =
      messageData?.message?.conversation ||
      messageData?.message?.extendedTextMessage?.text ||
      messageData?.message?.imageMessage?.caption ||
      '';

    if (!phone || !message || !instanceName) {
      return NextResponse.json({ error: 'Payload incompleto' }, { status: 400 });
    }

    // Busca a instância no banco pelo instanceKey
    const instance = await prisma.whatsAppInstance.findFirst({
      where: { instanceKey: instanceName },
      include: {
        user: { include: { subscription: true } },
        agent: true
      }
    });

    if (!instance || !instance.user) {
      console.warn(`EVOLUTION_WEBHOOK: Instância não reconhecida: ${instanceName}`);
      return NextResponse.json({ error: 'Instância não reconhecida' }, { status: 404 });
    }

    // Verifica limites de mensagens
    const subscription = instance.user.subscription;
    if (!subscription || subscription.messagesUsed >= subscription.messagesLimit) {
      console.warn(`EVOLUTION_WEBHOOK: Limite excedido para ${instance.user.id}`);
      return NextResponse.json({ error: 'Limite de mensagens excedido' }, { status: 403 });
    }

    // Incrementa contador de mensagens
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { messagesUsed: { increment: 1 } }
    });

    const agent = instance.agent;
    if (!agent) {
      return NextResponse.json({ error: 'Nenhum agente ativo' }, { status: 404 });
    }

    // Encaminha ao N8N Evolution Workflow
    if (N8N_WEBHOOK_URL) {
      const n8nRes = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: instance.userId,
          customerPhone: phone,
          customerName: pushName,
          message,
          agentConfig: {
            prompt: agent.systemPrompt,
            temperature: agent.temperature,
            name: agent.name
          },
          instance: {
            instanceKey: instance.instanceKey,
            token: EVOLUTION_URL, // Evolution usa URL + apikey, não token por instância
            providerUrl: EVOLUTION_URL,
            provider: 'evolution'
          }
        })
      });

      if (!n8nRes.ok) {
        console.error('EVOLUTION_N8N_ERROR:', await n8nRes.text());
      }
    }

    return NextResponse.json({ success: true, routed: true });

  } catch (err) {
    console.error('EVOLUTION_WEBHOOK_ERROR:', err);
    return NextResponse.json({ error: 'Erro interno no webhook' }, { status: 500 });
  }
}
