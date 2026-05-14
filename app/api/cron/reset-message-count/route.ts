import { NextResponse } from 'next/server';
import { requireCron } from '@/lib/auth/requireCron';
import { prisma } from '@/lib/prisma';
import { InstancePlan } from '@prisma/client';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Mantido para compatibilidade — use /api/cron/reset-messages para o cron N8N
export async function POST(request: Request) {
  const err = requireCron(request);
  if (err) return err;

  try {
    const result = await prisma.whatsAppInstance.updateMany({
      where: { plan: InstancePlan.TRIAL },
      data: { messageCount: 0 },
    });
    logger.info('Message count reset', { count: result.count });
    return NextResponse.json({ success: true, count: result.count, resetAt: new Date().toISOString() });
  } catch (e) {
    logger.error('Reset message count failed', {});
    return NextResponse.json({ error: 'Erro ao resetar contadores' }, { status: 500 });
  }
}
