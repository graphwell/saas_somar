import { prisma } from '@/lib/prisma';
import { NotificationType, InstanceStatus, InstancePlan } from '@prisma/client';

export async function notifyAdmin(type: NotificationType, message: string, userId?: string) {
  // Evita duplicar a mesma notificação não lida
  const recent = await prisma.adminNotification.findFirst({
    where: { type, read: false },
    orderBy: { createdAt: 'desc' },
  });

  if (recent) return; // já existe alerta ativo desse tipo

  await prisma.adminNotification.create({
    data: { type, message, userId },
  });
}

export async function checkAndNotifyPoolLevels() {
  const [trialIdle, paidIdle] = await Promise.all([
    prisma.whatsAppInstance.count({
      where: { status: InstanceStatus.IDLE, plan: InstancePlan.TRIAL },
    }),
    prisma.whatsAppInstance.count({
      where: { status: InstanceStatus.IDLE, plan: InstancePlan.PAID },
    }),
  ]);

  if (trialIdle === 0) {
    await notifyAdmin(
      NotificationType.TRIAL_POOL_EMPTY,
      'Pool de instâncias Trial está VAZIO. Novos cadastros não conseguem se conectar.'
    );
  } else if (trialIdle < 2) {
    await notifyAdmin(
      NotificationType.TRIAL_POOL_LOW,
      `Pool Trial com apenas ${trialIdle} instância disponível. Adicione mais para garantir novos cadastros.`
    );
  }

  if (paidIdle === 0) {
    await notifyAdmin(
      NotificationType.PAID_POOL_EMPTY,
      'Pool de instâncias Pagas está VAZIO. Assinantes não conseguem migrar de plano.'
    );
  } else if (paidIdle < 2) {
    await notifyAdmin(
      NotificationType.PAID_POOL_LOW,
      `Pool Pago com apenas ${paidIdle} instância disponível. Adicione mais para novos assinantes.`
    );
  }
}
