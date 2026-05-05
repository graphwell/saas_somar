import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user || !(session.user as any).id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const userId = (session.user as any).id;

  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId }
    });

    const instance = await prisma.whatsAppInstance.findFirst({
        where: { userId }
    });

    return NextResponse.json({
      plan: subscription?.planType || 'none',
      status: instance?.status || 'disconnected',
      instanceKey: instance?.instanceKey || null,
      provider: instance?.provider || null,
      messagesSentToday: instance?.messageCount || 0,
      limit: instance?.plan === 'TRIAL' ? 100 : (subscription?.messagesLimit || '∞'),
      needsReconnect: instance?.status === 'DISABLED',
      expiresAt: subscription?.currentPeriodEnd,
    });
  } catch (error) {
    console.error('USER_STATUS_ERROR:', error);
    return NextResponse.json({ error: 'Erro ao buscar status' }, { status: 500 });
  }
}
