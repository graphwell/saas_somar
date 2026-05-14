import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { NotificationType } from '@prisma/client';
import { processWaitingQueue } from './instanceService';

export async function migrateTrialToPaid(userId: string) {
  const result = await prisma.$transaction(async (tx) => {
    const trialInstance = await tx.whatsAppInstance.findFirst({
      where: { userId, plan: 'TRIAL', status: 'IN_USE' },
    });

    const paidInstance = await tx.whatsAppInstance.findFirst({
      where: { status: 'IDLE', plan: 'PAID' },
      orderBy: { createdAt: 'asc' },
    });

    if (!paidInstance) {
      await tx.adminNotification.create({
        data: {
          type: NotificationType.NO_PAID_INSTANCE,
          message: `URGENTE: Usuário ${userId} pagou mas não há instâncias PAID disponíveis`,
          userId,
        },
      });
      return { success: false as const, reason: 'NO_PAID_INSTANCE', trialReleased: false };
    }

    if (trialInstance) {
      await tx.whatsAppInstance.update({
        where: { id: trialInstance.id },
        data: { status: 'IDLE', userId: null, messageCount: 0 },
      });
    }

    const updated = await tx.whatsAppInstance.updateMany({
      where: { id: paidInstance.id, status: 'IDLE' },
      data: { status: 'IN_USE', userId },
    });

    if (updated.count === 0) {
      return { success: false as const, reason: 'RACE_CONDITION', trialReleased: !!trialInstance };
    }

    await tx.subscription.updateMany({
      where: { userId },
      data: { planType: 'pro', messagesLimit: 999999, status: 'active' },
    });

    return { success: true as const, paidInstanceId: paidInstance.id, trialReleased: !!trialInstance };
  });

  if (result.success && result.trialReleased) {
    processWaitingQueue().catch(err => logger.error('Queue processing failed', { err }));
  }

  logger.info('Migration result', { userId, success: result.success });
  return result;
}
