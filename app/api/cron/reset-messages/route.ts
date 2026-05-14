import { NextResponse } from 'next/server';
import { requireCron } from '@/lib/auth/requireCron';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const err = requireCron(request);
  if (err) return err;

  try {
    const updated = await prisma.whatsAppInstance.updateMany({
      where: { plan: 'TRIAL' },
      data: { messageCount: 0 },
    });
    logger.info('Daily message reset', { count: updated.count });
    return NextResponse.json({ success: true, reset: updated.count });
  } catch (e) {
    logger.error('Reset messages failed', {});
    return NextResponse.json({ error: 'Reset failed' }, { status: 500 });
  }
}
