import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  const userId = (session.user as any).id;

  const instance = await prisma.whatsAppInstance.findFirst({
    where: { userId },
    select: { instanceKey: true, token: true, provider: true },
  });

  if (!instance) {
    return NextResponse.json({ error: 'Sem instância vinculada' }, { status: 404 });
  }

  try {
    if (instance.provider === 'ULTRAMSG') {
      // Desconecta o número do WhatsApp no UltraMsg (logout)
      await fetch(
        `https://api.ultramsg.com/${instance.instanceKey}/instance/logout?token=${instance.token}`,
        { method: 'POST', cache: 'no-store' }
      );
    }

    if (instance.provider === 'WASENDER') {
      await fetch(
        `https://api.wasender.com/sessions/${instance.instanceKey}/disconnect`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${instance.token}` },
          cache: 'no-store',
        }
      );
    }

    return NextResponse.json({ success: true, message: 'WhatsApp desconectado. Escaneie o novo QR Code.' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
