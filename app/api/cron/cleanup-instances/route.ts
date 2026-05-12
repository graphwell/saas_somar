import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { InstanceStatus } from '@prisma/client';

// Cron: a cada 2h — libera instâncias de usuários com trial expirado
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // Busca usuários com trial expirado que ainda têm instância vinculada
    const expiredSubscriptions = await prisma.subscription.findMany({
      where: {
        planType: 'trial',
        currentPeriodEnd: { lt: new Date() },
      },
      select: { userId: true },
    });

    if (expiredSubscriptions.length === 0) {
      return NextResponse.json({ success: true, released: 0 });
    }

    const expiredUserIds = expiredSubscriptions.map(s => s.userId);

    // Libera as instâncias desses usuários (volta para o pool)
    const result = await prisma.whatsAppInstance.updateMany({
      where: {
        userId: { in: expiredUserIds },
        status: InstanceStatus.IN_USE,
      },
      data: {
        userId: null,
        status: InstanceStatus.IDLE,
        messageCount: 0,
      },
    });

    return NextResponse.json({
      success: true,
      released: result.count,
      ranAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[CRON_CLEANUP_ERROR]', error);
    return NextResponse.json({ error: 'Erro no cleanup' }, { status: 500 });
  }
}
