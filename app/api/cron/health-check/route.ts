import { NextResponse } from 'next/server';
import { requireCron } from '@/lib/auth/requireCron';
import { prisma } from '@/lib/prisma';
import { checkInstanceHealth } from '@/lib/services/whatsapp/WhatsAppService';
import { NotificationType } from '@prisma/client';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const err = requireCron(request);
  if (err) return err;

  try {
    const instances = await prisma.whatsAppInstance.findMany({
      where: { status: 'IN_USE' },
    });

    const results: { id: string; healthy: boolean }[] = [];

    for (const inst of instances) {
      const healthy = await checkInstanceHealth(inst);
      if (!healthy) {
        const exists = await prisma.adminNotification.findFirst({
          where: { type: NotificationType.INSTANCE_DISCONNECTED, userId: inst.userId, read: false },
        });
        if (!exists) {
          await prisma.adminNotification.create({
            data: {
              type: NotificationType.INSTANCE_DISCONNECTED,
              message: `Instância ${inst.instanceKey} desconectou (usuário: ${inst.userId})`,
              userId: inst.userId ?? undefined,
            },
          });
        }
      }
      results.push({ id: inst.id, healthy });
    }

    logger.info('Health check done', { checked: results.length });
    return NextResponse.json({ checked: results.length, results });
  } catch (e) {
    logger.error('Health check failed', {});
    return NextResponse.json({ error: 'Health check failed' }, { status: 500 });
  }
}
