import { prisma } from '@/lib/prisma';

export class WhatsappService {
  /**
   * Busca uma instância disponível no pool (sem usuário).
   */
  static async getAvailableInstance() {
    return await prisma.whatsAppInstance.findFirst({
      where: {
        userId: null,
      },
    });
  }

  /**
   * Atribui uma instância ao usuário.
   */
  static async assignInstanceToUser(userId: string, instanceId: string) {
    return await prisma.whatsAppInstance.update({
        where: { id: instanceId },
        data: { userId }
    });
  }

  /**
   * Verifica e gerencia o limite diário/mensal de mensagens.
   */
  static async checkMessageLimit(userId: string) {
    const subscription = await prisma.subscription.findUnique({
      where: { userId }
    });

    if (!subscription) throw new Error("Assinatura não encontrada para este usuário.");

    if (subscription.messagesUsed >= subscription.messagesLimit) {
      throw new Error("Limite de mensagens atingido para este ciclo. Faça o upgrade para remover os limites.");
    }
  }

  /**
   * Libera uma instância (quando usuário desativa ou exclui conta).
   */
  static async deactivateInstance(userId: string) {
    return await prisma.$transaction(async (tx) => {
      const instance = await tx.whatsAppInstance.findFirst({
        where: { userId }
      });

      if (instance) {
        await tx.whatsAppInstance.update({
          where: { id: instance.id },
          data: { status: 'disconnected', userId: null }
        });
      }
    });
  }
}
