import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const N8N_WEBHOOK_URL = process.env.N8N_EVOLUTION_WEBHOOK_URL || process.env.N8N_WEBHOOK_URL || '';
const EVOLUTION_URL = (process.env.EVOLUTION_API_URL || 'https://evolution.somar.ia.br').replace(/^http:\/\//i, 'https://');

export async function POST(
  request: Request,
  { params }: { params: { instance: string } }
) {
  try {
    const body = await request.json();
    const event = (body.event || '').toLowerCase();
    const data = body.data || body;
    const instanceKey = params.instance;

    // 1. ATUALIZAÇÃO DE STATUS E QR CODE
    if (event === 'connection_update' || event === 'connection.update') {
      const state = data.state || data.connection;
      const status = state === 'open' ? 'connected' : 'disconnected';
      
      await prisma.whatsAppInstance.updateMany({
        where: { instanceKey: instanceKey },
        data: { status, updatedAt: new Date() }
      });
      return NextResponse.json({ ok: true, status });
    }

    if (event === 'qrcode_updated' || event === 'qrcode.updated') {
      const qrcode = data.qrcode?.base64 || data.base64;
      if (qrcode) {
        await prisma.whatsAppInstance.updateMany({
          where: { instanceKey: instanceKey },
          data: { status: 'awaiting_qr' }
          // qrCode não existe no schema, então atualizamos apenas o status para a UI saber.
        });
      }
      return NextResponse.json({ ok: true, qrcode: true });
    }

    // 2. REPASSE PARA O N8N (MESSAGES_UPSERT)
    if (event === 'messages_upsert' || event === 'messages.upsert') {
      const messageData = data;

      // Ignora mensagens enviadas pela própria instância
      if (messageData?.key?.fromMe) {
        return NextResponse.json({ ok: true, ignored: true, reason: 'fromMe' });
      }

      const phone = messageData?.key?.remoteJid?.replace('@s.whatsapp.net', '');
      const pushName = messageData?.pushName || 'Cliente';
      const message =
        messageData?.message?.conversation ||
        messageData?.message?.extendedTextMessage?.text ||
        messageData?.message?.imageMessage?.caption ||
        '';

      if (!phone || !message) {
        return NextResponse.json({ ok: true, ignored: true, reason: 'empty_payload' });
      }

      // Busca a instância no banco
      const instance = await prisma.whatsAppInstance.findFirst({
        where: { instanceKey: instanceKey },
        include: {
          user: { include: { subscription: true } },
          agent: true
        }
      });

      if (!instance || !instance.user) {
        console.warn(`[WEBHOOK] Instância não reconhecida: ${instanceKey}`);
        return NextResponse.json({ ok: true, ignored: true, reason: 'instance_not_found' });
      }

      // Verifica limites de mensagens
      const subscription = instance.user.subscription;
      if (!subscription || subscription.messagesUsed >= subscription.messagesLimit) {
        console.warn(`[WEBHOOK] Limite excedido para ${instance.user.id}`);
        return NextResponse.json({ ok: true, ignored: true, reason: 'limit_exceeded' });
      }

      // Incrementa contador de mensagens
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { messagesUsed: { increment: 1 } }
      });

      const agent = instance.agent;
      if (!agent) {
        return NextResponse.json({ ok: true, ignored: true, reason: 'no_agent' });
      }

      // Repassa ao N8N Evolution Workflow
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
              token: EVOLUTION_URL, // Evolution usa URL + apikey no N8N
              providerUrl: EVOLUTION_URL,
              provider: 'evolution'
            }
          })
        });

        if (!n8nRes.ok) {
          console.error('[WEBHOOK N8N ERROR]:', await n8nRes.text());
        }
      }

      return NextResponse.json({ ok: true, routed: true });
    }

    // Se o evento for outro (ex: messages_update), só retorna 200
    return NextResponse.json({ ok: true, event });

  } catch (err) {
    console.error('[WEBHOOK ERROR]:', err);
    // Sempre retorna 200 OK para evitar loops na Evolution API
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
