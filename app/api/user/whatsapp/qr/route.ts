import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { assignTrialInstance } from '@/lib/services/whatsapp-pool.service';
import { addToWaitingQueue } from '@/lib/services/instanceService';

export const dynamic = 'force-dynamic';

async function getOrAssignInstance(userId: string) {
  // 1. Verifica se já tem instância
  let instance = await prisma.whatsAppInstance.findFirst({
    where: { userId },
    select: { instanceKey: true, token: true, provider: true, plan: true, messageCount: true },
  });

  if (instance) return { instance, assigned: false };

  // 2. Tenta atribuir automaticamente baseado no plano
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    select: { planType: true },
  });

  try {
    if (!subscription || subscription.planType === 'trial') {
      await assignTrialInstance(userId);
    } else {
      const { migrateToPaidInstance } = await import('@/lib/services/whatsapp-pool.service');
      await migrateToPaidInstance(userId);
    }

    instance = await prisma.whatsAppInstance.findFirst({
      where: { userId },
      select: { instanceKey: true, token: true, provider: true, plan: true, messageCount: true },
    });

    // Desconecta sessão anterior do WhatsApp antes de entregar ao novo usuário
    // Garante que o usuário sempre veja um QR Code fresco
    if (instance) {
      const { disconnectInstance } = await import('@/lib/services/whatsapp/WhatsAppService');
      await disconnectInstance(instance as any).catch(() => {});
      // Aguarda o provedor processar o logout antes de buscar o QR
      await new Promise(r => setTimeout(r, 2000));
    }

    return { instance, assigned: true };
  } catch {
    // Pool vazio — adiciona à fila de espera
    const type = (!subscription || subscription.planType === 'trial') ? 'TRIAL' : 'PAID';
    await addToWaitingQueue(userId, type).catch(() => {});
    return { instance: null, assigned: false };
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  const userId = (session.user as any).id;

  // Admins não usam instâncias WhatsApp
  const sessionUser = session.user as any;
  if (sessionUser?.role === 'ADMIN') {
    return NextResponse.json({ status: 'no_instance', connected: false, reason: 'admin' });
  }

  const { instance } = await getOrAssignInstance(userId);

  if (!instance) {
    return NextResponse.json({ status: 'no_instance', connected: false });
  }

  const meta = { instanceKey: instance.instanceKey, provider: instance.provider, plan: instance.plan, messageCount: instance.messageCount };

  // Busca status + QR no provedor
  if (instance.provider === 'ULTRAMSG') {
    try {
      const [statusRes, qrRes] = await Promise.all([
        fetch(
          `https://api.ultramsg.com/${instance.instanceKey}/instance/status?token=${instance.token}`,
          { cache: 'no-store' }
        ),
        fetch(
          `https://api.ultramsg.com/${instance.instanceKey}/instance/qr?token=${instance.token}`,
          { cache: 'no-store' }
        ),
      ]);

      const statusData = await statusRes.json().catch(() => ({}));
      const qrData = await qrRes.json().catch(() => ({}));

      if (!statusRes.ok || statusData?.error) {
        return NextResponse.json({
          ...meta,
          status: 'invalid_credentials',
          connected: false,
          error: statusData?.error ?? 'Token inválido ou instância não encontrada no UltraMsg.',
        });
      }

      const rawStatus =
        statusData?.status?.accountStatus?.substatus ??
        statusData?.status?.accountStatus?.status ??
        statusData?.status ?? '';

      const connected = ['authenticated', 'connected', 'normal'].includes(
        String(rawStatus).toLowerCase()
      );

      // Instância conectada mas usuário nunca usou (messageCount === 0):
      // a sessão pertence a número anterior — desconecta e gera QR fresco
      if (connected && instance.messageCount === 0) {
        await fetch(
          `https://api.ultramsg.com/${instance.instanceKey}/instance/logout?token=${instance.token}`,
          { method: 'POST', cache: 'no-store' }
        ).catch(() => {});
        // Aguarda o provedor processar o logout
        await new Promise(r => setTimeout(r, 3000));
        // Busca QR após logout
        const freshQr = await fetch(
          `https://api.ultramsg.com/${instance.instanceKey}/instance/qr?token=${instance.token}`,
          { cache: 'no-store' }
        ).then(r => r.json()).catch(() => ({}));
        if (freshQr?.QRCode) {
          return NextResponse.json({ ...meta, status: 'qrCode', connected: false, qrCode: freshQr.QRCode });
        }
        return NextResponse.json({ ...meta, status: 'loading', connected: false });
      }

      if (connected) {
        return NextResponse.json({ ...meta, status: 'connected', connected: true });
      }

      if (qrData?.QRCode) {
        return NextResponse.json({ ...meta, status: 'qrCode', connected: false, qrCode: qrData.QRCode });
      }

      return NextResponse.json({ ...meta, status: 'loading', connected: false });
    } catch (err: any) {
      return NextResponse.json({ ...meta, status: 'error', connected: false, error: err.message });
    }
  }

  if (instance.provider === 'WASENDER') {
    try {
      const res = await fetch(
        `https://api.wasender.com/sessions/${instance.instanceKey}`,
        { headers: { Authorization: `Bearer ${instance.token}` }, cache: 'no-store' }
      );
      const data = await res.json().catch(() => ({}));

      if (!res.ok || data?.error) {
        return NextResponse.json({
          ...meta,
          status: 'invalid_credentials',
          connected: false,
          error: data?.error ?? 'Token inválido ou sessão não encontrada no WaSender.',
        });
      }

      const connected = data?.status === 'CONNECTED' || data?.connected === true;
      const qrCode = data?.qrCode || data?.QRCode;

      // Sessão anterior detectada sem uso — desconecta para gerar QR fresco
      if (connected && instance.messageCount === 0) {
        await fetch(`https://api.wasender.com/sessions/${instance.instanceKey}/disconnect`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${instance.token}` },
        }).catch(() => {});
        await new Promise(r => setTimeout(r, 3000));
        return NextResponse.json({ ...meta, status: 'loading', connected: false });
      }

      return NextResponse.json({
        ...meta,
        status: connected ? 'connected' : qrCode ? 'qrCode' : 'loading',
        connected,
        qrCode,
      });
    } catch (err: any) {
      return NextResponse.json({ ...meta, status: 'error', connected: false, error: err.message });
    }
  }

  return NextResponse.json({ status: 'error', connected: false, error: 'Provedor não suportado.' });
}
