import { NextResponse } from 'next/server';
import { requireCron } from '@/lib/auth/requireCron';
import { prisma } from '@/lib/prisma';
import { processWaitingQueue, checkAndNotifyPoolLevel } from '@/lib/services/instanceService';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const err = requireCron(request);
  if (err) return err;

  try {
    const expired = await prisma.subscription.findMany({
      where: {
        planType: 'trial',
        status: 'active',
        currentPeriodEnd: { lt: new Date() },
      },
      select: { userId: true },
    });

    for (const sub of expired) {
      await prisma.whatsAppInstance.updateMany({
        where: { userId: sub.userId, plan: 'TRIAL', status: 'IN_USE' },
        data: { status: 'IDLE', userId: null, messageCount: 0 },
      });
      await prisma.subscription.updateMany({
        where: { userId: sub.userId },
        data: { status: 'canceled' },
      });
    }

    if (expired.length > 0) await processWaitingQueue();
    await checkAndNotifyPoolLevel();

    logger.info('Cleanup done', { expired: expired.length });
    return NextResponse.json({ success: true, expired: expired.length });
  } catch (e) {
    logger.error('Cleanup failed', {});
    return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 });
  }
}
