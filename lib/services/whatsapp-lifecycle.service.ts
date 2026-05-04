import { prisma } from '@/lib/prisma';

const EVOLUTION_URL = (process.env.EVOLUTION_API_URL || 'https://evolution.somar.ia.br').replace(/\/$/, '');
const EVOLUTION_KEY = process.env.EVOLUTION_API_KEY || '';
const WEBHOOK_BASE = (process.env.WEBHOOK_BASE_URL || 'https://saas.somar.ia.br/api/webhooks/evolution').replace(/\/$/, '');

export class WhatsappLifecycleService {
  /**
   * Verifica se a instância existe na Evolution API
   */
  static async checkInstanceExists(instanceName: string): Promise<boolean> {
    try {
      const res = await fetch(`${EVOLUTION_URL}/instance/connectionState/${instanceName}`, {
        method: 'GET',
        headers: { apikey: EVOLUTION_KEY },
      });
      return res.status === 200;
    } catch (e) {
      return false;
    }
  }

  /**
   * Força a deleção da instância na Evolution API
   */
  static async forceDeleteInstance(instanceName: string) {
    try {
      const exists = await this.checkInstanceExists(instanceName);
      if (!exists) return;

      const res = await fetch(`${EVOLUTION_URL}/instance/delete/${instanceName}`, {
        method: 'DELETE',
        headers: { apikey: EVOLUTION_KEY },
      });

      if (!res.ok) {
        console.warn(`[Lifecycle] Falha ao deletar instância ${instanceName} - Status ${res.status}`);
      }
    } catch (e) {
      console.error(`[Lifecycle] Erro de rede ao deletar instância ${instanceName}:`, e);
    }
  }

  /**
   * Registra webhook usando HTTPS Absoluto sem trailing slash
   */
  static async registerWebhook(instanceName: string) {
    try {
      const res = await fetch(`${EVOLUTION_URL}/webhook/set/${instanceName}`, {
        method: 'POST',
        headers: {
          apikey: EVOLUTION_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: `${WEBHOOK_BASE}/${instanceName}`,
          webhook_by_events: false,
          webhook_base64: false,
          events: [
            'QRCODE_UPDATED',
            'CONNECTION_UPDATE',
            'MESSAGES_UPSERT',
            'MESSAGES_UPDATE'
          ],
        }),
      });

      if (!res.ok) {
        console.error(`[Lifecycle] Erro ao registrar webhook para ${instanceName}`);
      }
    } catch (e) {
      console.error(`[Lifecycle] Exceção ao registrar webhook para ${instanceName}:`, e);
    }
  }

  /**
   * Criação do Zero (limpa qualquer rastro anterior e registra os webhooks corretos)
   */
  static async createFreshInstance(instanceName: string) {
    await this.forceDeleteInstance(instanceName);
    await new Promise((r) => setTimeout(r, 2000)); // aguarda a limpeza

    const res = await fetch(`${EVOLUTION_URL}/instance/create`, {
      method: 'POST',
      headers: {
        apikey: EVOLUTION_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        instanceName,
        qrcode: true,
        integration: 'WHATSAPP-BAILEYS',
        token: instanceName, // Importante para v2
      }),
    });

    const data = await res.json();

    if (res.ok) {
      // Assim que criar a instância limpa, acopla o webhook correto
      await this.registerWebhook(instanceName);
    }

    return { res, data };
  }
}
