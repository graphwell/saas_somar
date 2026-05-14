import { NextResponse } from 'next/server';
import { requireCron } from '@/lib/auth/requireCron';
import { prisma } from '@/lib/prisma';
import { InstanceStatus } from '@prisma/client';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Mantido para compatibilidade — use /api/cron/cleanup-expired para o cron N8N
export async function POST(request: Request) {
  const err = requireCron(request);
  if (err) return err;

  try {
    const expired = await prisma.subscription.findMany({
      where: { planType: 'trial', currentPeriodEnd: { lt: new Date() } },
      select: { userId: true },
    });

    if (expired.length === 0) return NextResponse.json({ success: true, released: 0 });

    const userIds = expired.map(s => s.userId);
    const result = await prisma.whatsAppInstance.updateMany({
      where: { userId: { in: userIds }, status: InstanceStatus.IN_USE },
      data: { userId: null, status: InstanceStatus.IDLE, messageCount: 0 },
    });

    logger.info('Cleanup instances', { released: result.count });
    return NextResponse.json({ success: true, released: result.count });
  } catch (e) {
    logger.error('Cleanup instances failed', {});
    return NextResponse.json({ error: 'Erro no cleanup' }, { status: 500 });
  }
}
