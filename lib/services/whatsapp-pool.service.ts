import { prisma } from '@/lib/prisma';
import { InstanceStatus, InstancePlan, Provider } from '@prisma/client';

/**
 * Quando cliente se cadastra -> atribui instância TRIAL (UltraMsg)
 */
export async function assignTrialInstance(userId: string) {
  const instance = await prisma.whatsAppInstance.findFirst({
    where: {
      status: InstanceStatus.IDLE,
      plan: InstancePlan.TRIAL,
      provider: Provider.ULTRAMSG
    }
  });
  
  if (!instance) {
    throw new Error('Nenhuma instância Trial disponível no momento. Contate o suporte.');
  }
  
  await prisma.whatsAppInstance.update({
    where: { id: instance.id },
    data: { 
      status: InstanceStatus.IN_USE, 
      userId 
    }
  });
  
  return instance;
}

/**
 * Quando cliente assina -> migra para WaSender
 */
export async function migrateToPaidInstance(userId: string) {
  // 1. Libera instância Trial atual (se houver)
  await prisma.whatsAppInstance.updateMany({
    where: { 
      userId, 
      plan: InstancePlan.TRIAL 
    },
    data: { 
      status: InstanceStatus.IDLE, 
      userId: null, 
      messageCount: 0 
    }
  });
  
  // 2. Busca uma instância Paga (WaSender) disponível
  const paidInstance = await prisma.whatsAppInstance.findFirst({
    where: {
      status: InstanceStatus.IDLE,
      plan: InstancePlan.PAID,
      provider: Provider.WASENDER
    }
  });
  
  if (!paidInstance) {
    // Notifica admin que precisa adicionar nova instância WaSender
    await notifyAdminNeedInstance(userId);
    throw new Error('Sua instância premium está sendo preparada. Você receberá uma notificação em breve assim que estiver pronta.');
  }
  
  // 3. Atribui a nova instância
  await prisma.whatsAppInstance.update({
    where: { id: paidInstance.id },
    data: { 
      status: InstanceStatus.IN_USE, 
      userId 
    }
  });
  
  return paidInstance;
}

/**
 * Notifica o administrador via e-mail (simulado por enquanto)
 */
async function notifyAdminNeedInstance(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@somar.ia.br';
  
  console.log(`[NOTIFY_ADMIN] Cliente ${user?.name} (${user?.email}) assinou e precisa de uma instância WaSender.`);
  
  // Aqui você integraria com seu serviço de e-mail (Resend, SendGrid, etc.)
  /*
  await sendEmail({
    to: adminEmail,
    subject: '⚠️ Nova instância WaSender necessária',
    text: `Cliente ${user?.name} (${user?.email}) assinou um plano pago. Adicione uma nova instância WaSender no painel admin.`
  });
  */
}
