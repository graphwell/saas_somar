import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { assignTrialInstance } from '@/lib/services/whatsapp-pool.service';
import { addToWaitingQueue } from '@/lib/services/instanceService';

export const dynamic = 'force-dynamic';

async function getOrAssignInstance(userId: string) {
  // 1. Já tem instância?
  let instance = await prisma.whatsAppInstance.findFirst({
    where: { userId },
    select: { instanceKey: true, token: true, provider: true, plan: true, messageCount: true },
  });
  if (instance) return instance;

  // 2. Não tem — tentar atribuir do pool
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
    // Busca a instância recém-atribuída
    instance = await prisma.whatsAppInstance.findFirst({
      where: { userId },
      select: { instanceKey: true, token: true, provider: true, plan: true, messageCount: true },
    });
    return instance;
  } catch {
    // Pool vazio — coloca na fila de espera
    const type = (!subscription || subscription.planType === 'trial') ? 'TRIAL' : 'PAID';
    addToWaitingQueue(userId, type).catch(() => {});
    return null;
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

  const instance = await getOrAssignInstance(userId);

  if (!instance) {
    return NextResponse.json({ status: 'no_instance', connected: false });
  }

  const meta = { instanceKey: instance.instanceKey, provider: instance.provider, plan: instance.plan, messageCount: instance.messageCount };

  // Busca status + QR no provedor
  if (instance.provider === 'ULTRAMSG') {
    try {
      // Busca status (JSON) e QR (PNG binário) em paralelo
      const [statusRes, qrRes] = await Promise.all([
        fetch(`https://api.ultramsg.com/${instance.instanceKey}/instance/status?token=${instance.token}`, { cache: 'no-store' }),
        fetch(`https://api.ultramsg.com/${instance.instanceKey}/instance/qr?token=${instance.token}`, { cache: 'no-store' }),
      ]);

      const statusData = await statusRes.json().catch(() => ({}));

      if (!statusRes.ok || statusData?.error) {
        return NextResponse.json({ ...meta, status: 'invalid_credentials', connected: false, error: statusData?.error });
      }

      // O campo correto de conexão é accountStatus.status, não substatus
      // "authenticated" = conectado | "qr" = aguardando scan | outros = loading
      const accountStatus = String(statusData?.status?.accountStatus?.status ?? '').toLowerCase();
      const connected = accountStatus === 'authenticated';
      const needsQr   = accountStatus === 'qr' || accountStatus === '' || !accountStatus;

      if (connected) {
        return NextResponse.json({ ...meta, status: 'connected', connected: true });
      }

      if (needsQr) {
        // QR endpoint retorna PNG binário — ler sempre como ArrayBuffer,
        // independente do content-type retornado pelo UltraMsg
        if (qrRes.ok) {
          const buffer = await qrRes.arrayBuffer();
          if (buffer.byteLength > 0) {
            // Verifica magic bytes PNG: 0x89 0x50 0x4E 0x47 (\x89PNG)
            const bytes = new Uint8Array(buffer);
            const isPng = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47;
            if (isPng) {
              const base64 = Buffer.from(buffer).toString('base64');
              return NextResponse.json({ ...meta, status: 'qrCode', connected: false, qrCode: `data:image/png;base64,${base64}` });
            }
            // Não é PNG — tenta parsear como JSON
            const text = Buffer.from(buffer).toString('utf8');
            try {
              const qrJson = JSON.parse(text);
              const qrCode = qrJson?.QRCode ?? qrJson?.qrCode ?? qrJson?.qr ?? null;
              if (qrCode) return NextResponse.json({ ...meta, status: 'qrCode', connected: false, qrCode });
            } catch { /* não é JSON */ }
          }
        }
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
