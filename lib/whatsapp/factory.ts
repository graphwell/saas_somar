export interface NormalizedMessage {
  telefone: string;
  nome: string;
  mensagem: string;
  tipo: 'text' | 'audio' | 'image' | 'document' | 'other';
  instanceId: string;
  provider: 'ultramsg' | 'wasender';
}

export interface InstanceStatus {
  connected: boolean;   // true = WhatsApp escaneado e pronto
  qrCode?: string;      // base64 PNG para exibir ao usuário
  status: 'connected' | 'qrCode' | 'loading' | 'disconnected' | 'error';
}

export interface ProviderAdapter {
  normalizeWebhook(payload: any, instanceId: string): NormalizedMessage | null;
  sendMessage(to: string, message: string, token: string, instanceId: string): Promise<boolean>;
  getInstanceStatus(token: string, instanceId: string): Promise<InstanceStatus>;
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

  async getInstanceStatus(token: string, instanceId: string): Promise<InstanceStatus> {
    try {
      const [statusRes, qrRes] = await Promise.all([
        fetch(`https://api.ultramsg.com/${instanceId}/instance/status?token=${token}`),
        fetch(`https://api.ultramsg.com/${instanceId}/instance/qr?token=${token}`),
      ]);

      const statusData = await statusRes.json();
      const qrData = await qrRes.json();

      const rawStatus = statusData?.status?.accountStatus?.substatus ?? statusData?.status ?? '';
      const connected = rawStatus === 'authenticated' || rawStatus === 'connected';

      return {
        connected,
        status: connected ? 'connected' : qrData?.QRCode ? 'qrCode' : 'loading',
        qrCode: qrData?.QRCode || undefined,
      };
    } catch (e) {
      console.error('[UltraMsg] Status error:', e);
      return { connected: false, status: 'error' };
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
      const response = await fetch('https://api.wasender.com/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          sessionId: instanceId,
          to: to.includes('@') ? to : `${to}@c.us`,
          text: message,
        }),
      });
      return response.ok;
    } catch (e) {
      console.error('[WaSender] Error sending message:', e);
      return false;
    }
  }

  async getInstanceStatus(token: string, instanceId: string): Promise<InstanceStatus> {
    try {
      const res = await fetch(`https://api.wasender.com/sessions/${instanceId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      const connected = data?.status === 'CONNECTED' || data?.connected === true;
      const qrCode = data?.qrCode || data?.QRCode || undefined;
      return {
        connected,
        status: connected ? 'connected' : qrCode ? 'qrCode' : 'loading',
        qrCode,
      };
    } catch (e) {
      console.error('[WaSender] Status error:', e);
      return { connected: false, status: 'error' };
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
