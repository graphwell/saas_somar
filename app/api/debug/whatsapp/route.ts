import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Login necessário' }, { status: 401 });
  const userId = (session.user as any).id;

  const instance = await prisma.whatsAppInstance.findFirst({
    where: { userId },
    select: { instanceKey: true, token: true, provider: true, plan: true, messageCount: true, status: true },
  });

  if (!instance) {
    return NextResponse.json({ error: 'Sem instância vinculada a este usuário' });
  }

  const BASE = 'https://api.ultramsg.com';
  const { instanceKey, token } = instance;

  const [statusRaw, qrRaw, logoutTest] = await Promise.all([
    fetch(`${BASE}/${instanceKey}/instance/status?token=${token}`, { cache: 'no-store' })
      .then(r => r.json()).catch(e => ({ fetch_error: e.message })),
    fetch(`${BASE}/${instanceKey}/instance/qr?token=${token}`, { cache: 'no-store' })
      .then(r => r.json()).catch(e => ({ fetch_error: e.message })),
    // Testa o endpoint de logout (sem executar — só verifica o status HTTP)
    fetch(`${BASE}/${instanceKey}/instance/logout?token=${token}`, { method: 'HEAD', cache: 'no-store' })
      .then(r => ({ http_status: r.status, ok: r.ok })).catch(e => ({ fetch_error: e.message })),
  ]);

  return NextResponse.json({
    instance_in_db: {
      instanceKey,
      provider: instance.provider,
      plan: instance.plan,
      messageCount: instance.messageCount,
      status_in_db: instance.status,
    },
    ultramsg_status_raw: statusRaw,
    ultramsg_qr_raw: qrRaw,
    ultramsg_logout_endpoint_test: logoutTest,
  });
}
