export interface NormalizedMessage {
  telefone: string;
  nome: string;
  mensagem: string;
  tipo: 'text' | 'audio' | 'image' | 'document' | 'other';
  instanceId: string;
  provider: 'ultramsg' | 'wasender' | 'evolution';
}

export interface ProviderAdapter {
  normalizeWebhook(payload: any, instanceId: string): NormalizedMessage | null;
  sendMessage(to: string, message: string, token: string, instanceId: string): Promise<boolean>;
}

export class UltraMsgAdapter implements ProviderAdapter {
  normalizeWebhook(payload: any, instanceId: string): NormalizedMessage | null {
    // UltraMsg payload varies by event, usually 'message_create' or 'message_received'
    if (!payload || !payload.data) return null;
    
    // Ignore status messages or from the system
    if (payload.event_type !== 'message_received') return null;

    const data = payload.data;
    const isFromMe = data.fromMe;
    if (isFromMe) return null;

    return {
      telefone: data.from.split('@')[0], // removes @c.us
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
        token: token,
        to: to.includes('@') ? to : `${to}@c.us`,
        body: message
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: data.toString()
      });

      return response.ok;
    } catch (e) {
      console.error("Error sending UltraMsg:", e);
      return false;
    }
  }
}

export class WasenderAdapter implements ProviderAdapter {
  normalizeWebhook(payload: any, instanceId: string): NormalizedMessage | null {
    // Wasender payload format
    if (!payload || !payload.message || !payload.message.from) return null;
    
    // Ignore my own messages
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
      // Assuming Wasender generic API endpoint (adjust based on concrete Wasender URL)
      // Usually it's an endpoint where sessionId/apiKey is passed
      const url = `https://api.wasender.com/send-message`; 
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Example auth
        },
        body: JSON.stringify({
          sessionId: instanceId,
          to: to.includes('@') ? to : `${to}@c.us`,
          text: message
        })
      });

      return response.ok;
    } catch (e) {
      console.error("Error sending Wasender Message:", e);
      return false;
    }
  }
}

export class EvolutionAdapter implements ProviderAdapter {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor() {
    this.baseUrl = process.env.EVOLUTION_API_URL || 'http://evolution.somar.ia.br';
    this.apiKey = process.env.EVOLUTION_API_KEY || 'sua-chave-aqui-mude-isso';
  }

  normalizeWebhook(payload: any, instanceId: string): NormalizedMessage | null {
    // Evolution API v2 — evento messages.upsert
    if (payload?.key?.fromMe) return null;
    const message =
      payload?.message?.conversation ||
      payload?.message?.extendedTextMessage?.text ||
      payload?.message?.imageMessage?.caption ||
      '';
    if (!message) return null;
    return {
      telefone: payload?.key?.remoteJid?.replace('@s.whatsapp.net', '') || '',
      nome: payload?.pushName || 'Desconhecido',
      mensagem: message,
      tipo: payload?.message?.imageMessage ? 'image' : 'text',
      instanceId,
      provider: 'evolution'
    };
  }

  async sendMessage(to: string, message: string, _token: string, instanceId: string): Promise<boolean> {
    try {
      const url = `${this.baseUrl}/message/sendText/${instanceId}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.apiKey
        },
        body: JSON.stringify({
          number: to.includes('@') ? to.replace('@s.whatsapp.net', '') : to,
          text: message
        })
      });
      return res.ok;
    } catch (e) {
      console.error('Error sending Evolution message:', e);
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
      case 'evolution':
        return new EvolutionAdapter();
      default:
        throw new Error(`Provider ${provider} not supported`);
    }
  }
}
