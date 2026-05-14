import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { NotificationType } from '@prisma/client';

export async function assignInstanceToUser(userId: string, type: 'TRIAL' | 'PAID') {
  return await prisma.$transaction(async (tx) => {
    const instance = await tx.whatsAppInstance.findFirst({
      where: { status: 'IDLE', plan: type },
      orderBy: { createdAt: 'asc' },
    });

    if (!instance) {
      logger.warn('No IDLE instance available', { userId, type });
      return null;
    }

    // Update condicional: só atualiza se ainda IDLE — previne race condition
    const updated = await tx.whatsAppInstance.updateMany({
      where: { id: instance.id, status: 'IDLE' },
      data: { status: 'IN_USE', userId },
    });

    if (updated.count === 0) {
      logger.warn('Race condition: instance taken before assignment', { instanceId: instance.id });
      return null;
    }

    logger.info('Instance assigned', { instanceId: instance.id, userId, type });
    return tx.whatsAppInstance.findUnique({ where: { id: instance.id } });
  });
}

export async function addToWaitingQueue(userId: string, type: 'TRIAL' | 'PAID') {
  await prisma.waitingQueue.upsert({
    where: { userId },
    create: { userId, type },
    update: { type },
  });
  logger.info('User added to waiting queue', { userId, type });
}

export async function processWaitingQueue() {
  const waiting = await prisma.waitingQueue.findMany({
    orderBy: { createdAt: 'asc' },
    take: 10,
  });

  for (const entry of waiting) {
    const instance = await assignInstanceToUser(entry.userId, entry.type as 'TRIAL' | 'PAID');
    if (!instance) break; // pool esgotou

    await prisma.waitingQueue.delete({ where: { id: entry.id } });

    await prisma.adminNotification.create({
      data: {
        type: NotificationType.INSTANCE_READY,
        message: `Instância pronta para usuário ${entry.userId} — pode conectar agora`,
        userId: entry.userId,
      },
    });

    logger.info('Queue processed', { userId: entry.userId, instanceId: instance.id });
  }
}

export async function checkAndNotifyPoolLevel() {
  const [trialIdle, paidIdle] = await Promise.all([
    prisma.whatsAppInstance.count({ where: { status: 'IDLE', plan: 'TRIAL' } }),
    prisma.whatsAppInstance.count({ where: { status: 'IDLE', plan: 'PAID' } }),
  ]);

  if (trialIdle === 0) {
    const exists = await prisma.adminNotification.findFirst({
      where: { type: NotificationType.TRIAL_POOL_EMPTY, read: false },
    });
    if (!exists) {
      await prisma.adminNotification.create({
        data: {
          type: NotificationType.TRIAL_POOL_EMPTY,
          message: 'Pool Trial VAZIO — novos cadastros não conseguem se conectar',
        },
      });
    }
  } else if (trialIdle < 2) {
    const exists = await prisma.adminNotification.findFirst({
      where: { type: NotificationType.TRIAL_POOL_LOW, read: false },
    });
    if (!exists) {
      await prisma.adminNotification.create({
        data: {
          type: NotificationType.TRIAL_POOL_LOW,
          message: `Pool Trial com apenas ${trialIdle} instância(s) IDLE`,
        },
      });
    }
  }

  if (paidIdle === 0) {
    const exists = await prisma.adminNotification.findFirst({
      where: { type: NotificationType.PAID_POOL_EMPTY, read: false },
    });
    if (!exists) {
      await prisma.adminNotification.create({
        data: {
          type: NotificationType.PAID_POOL_EMPTY,
          message: 'Pool Pago VAZIO — assinantes não conseguem migrar',
        },
      });
    }
  }

  logger.info('Pool level checked', { trialIdle, paidIdle });
}
