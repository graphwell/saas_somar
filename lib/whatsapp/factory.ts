export interface NormalizedMessage {
  telefone: string;
  nome: string;
  mensagem: string;
  tipo: 'text' | 'audio' | 'image' | 'document' | 'other';
  instanceId: string;
  provider: 'ultramsg' | 'wasender';
}

export interface ProviderAdapter {
  normalizeWebhook(payload: any, instanceId: string): NormalizedMessage | null;
  sendMessage(to: string, message: string, token: string, instanceId: string): Promise<boolean>;
}

export class UltraMsgAdapter implements ProviderAdapter {
  normalizeWebhook(payload: any, instanceId: string): NormalizedMessage | null {
    if (!payload || !payload.data) return null;
    if (payload.event_type !== 'message_received') return null;

    const data = payload.data;
    if (data.fromMe) return null;

    return {
      telefone: data.from.split('@')[0],
      nome: data.pushName || 'Desconhecido',
      mensagem: data.body || '',
      tipo: data.type === 'chat' ? 'text' : data.type === 'image' ? 'image' : 'other',
      instanceId,
      provider: 'ultramsg'
    };
  }

  async sendMessage(to: string, message: string, token: string, instanceId: string): Promise<boolean> {
    try {
      const url = `https://api.ultramsg.com/${instanceId}/messages/chat`;
      const data = new URLSearchParams({
        token,
        to: to.includes('@') ? to : `${to}@c.us`,
        body: message
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: data.toString()
      });

      return response.ok;
    } catch (e) {
      console.error('[UltraMsg] Error sending message:', e);
      return false;
    }
  }
}

export class WasenderAdapter implements ProviderAdapter {
  normalizeWebhook(payload: any, instanceId: string): NormalizedMessage | null {
    if (!payload || !payload.message || !payload.message.from) return null;
    if (payload.message.fromMe) return null;

    return {
      telefone: payload.message.from.split('@')[0],
      nome: payload.message.senderName || 'Desconhecido',
      mensagem: payload.message.text?.body || payload.message.body || '',
      tipo: payload.message.type === 'chat' || payload.message.type === 'text' ? 'text' : 'other',
      instanceId,
      provider: 'wasender'
    };
  }

  async sendMessage(to: string, message: string, token: string, instanceId: string): Promise<boolean> {
    try {
      const url = `https://api.wasender.com/send-message`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          sessionId: instanceId,
          to: to.includes('@') ? to : `${to}@c.us`,
          text: message
        })
      });

      return response.ok;
    } catch (e) {
      console.error('[WaSender] Error sending message:', e);
      return false;
    }
  }
}

export class WhatsAppFactory {
  static getAdapter(provider: string): ProviderAdapter {
    switch (provider.toLowerCase()) {
      case 'ultramsg':
        return new UltraMsgAdapter();
      case 'wasender':
      case 'wasenderapi':
        return new WasenderAdapter();
      default:
        throw new Error(`Provider '${provider}' não suportado. Use ULTRAMSG ou WASENDER.`);
    }
  }
}
