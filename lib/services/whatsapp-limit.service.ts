import { prisma } from '@/lib/prisma';
import { InstancePlan } from '@prisma/client';

/**
 * Verifica se o usuário atingiu o limite de mensagens e incrementa o contador.
 */
export async function checkMessageLimit(userId: string) {
  const instance = await prisma.whatsAppInstance.findUnique({
    where: { userId }
  });
  
  if (!instance) {
    throw new Error('Nenhuma instância de WhatsApp vinculada a este usuário.');
  }
  
  // Se for plano TRIAL, verifica o limite de 100 mensagens/dia
  if (instance.plan === InstancePlan.TRIAL && instance.messageCount >= 100) {
    throw new Error('Limite diário de 100 mensagens atingido no plano Trial. Faça o upgrade para continuar enviando.');
  }
  
  // Incrementa o contador de mensagens na instância
  await prisma.whatsAppInstance.update({
    where: { id: instance.id },
    data: { 
      messageCount: { increment: 1 } 
    }
  });

  return instance;
}
