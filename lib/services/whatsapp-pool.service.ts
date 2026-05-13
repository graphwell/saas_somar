import { prisma } from '@/lib/prisma';
import { InstanceStatus, InstancePlan, Provider, NotificationType } from '@prisma/client';
import { notifyAdmin, checkAndNotifyPoolLevels } from './notification.service';

export async function assignTrialInstance(userId: string) {
  const instance = await prisma.whatsAppInstance.findFirst({
    where: {
      status: InstanceStatus.IDLE,
      plan: InstancePlan.TRIAL,
      provider: Provider.ULTRAMSG,
    },
  });

  if (!instance) {
    // Notifica admin que o pool trial está vazio
    await notifyAdmin(
      NotificationType.TRIAL_POOL_EMPTY,
      'Pool Trial VAZIO: novo usuário tentou se cadastrar mas não havia instância disponível.',
      userId
    );
    throw new Error('Nenhuma instância Trial disponível no momento. O administrador foi notificado.');
  }

  await prisma.whatsAppInstance.update({
    where: { id: instance.id },
    data: { status: InstanceStatus.IN_USE, userId },
  });

  // Verifica se pool ficou baixo após a atribuição
  await checkAndNotifyPoolLevels();

  return instance;
}

export async function migrateToPaidInstance(userId: string) {
  // 1. Libera instância Trial atual
  await prisma.whatsAppInstance.updateMany({
    where: { userId, plan: InstancePlan.TRIAL },
    data: { status: InstanceStatus.IDLE, userId: null, messageCount: 0 },
  });

  // 2. Busca instância Paga disponível
  const paidInstance = await prisma.whatsAppInstance.findFirst({
    where: {
      status: InstanceStatus.IDLE,
      plan: InstancePlan.PAID,
      provider: Provider.WASENDER,
    },
  });

  if (!paidInstance) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });

    await notifyAdmin(
      NotificationType.PAID_POOL_EMPTY,
      `Pool Pago VAZIO: ${user?.name} (${user?.email}) assinou mas não há instância WaSender disponível.`,
      userId
    );

    throw new Error(
      'Sua instância premium está sendo preparada. O administrador foi notificado e você receberá acesso em breve.'
    );
  }

  await prisma.whatsAppInstance.update({
    where: { id: paidInstance.id },
    data: { status: InstanceStatus.IN_USE, userId },
  });

  // Verifica se pool ficou baixo após a atribuição
  await checkAndNotifyPoolLevels();

  return paidInstance;
}
