import { IWhatsAppProvider, QRCodeResult } from './IWhatsAppProvider';
import { logger } from '@/lib/logger';

const BASE = 'https://api.wasender.com';

export class WaSenderProvider implements IWhatsAppProvider {
  private headers(token: string) {
    return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
  }

  async getQRCode(instanceKey: string, token: string): Promise<QRCodeResult> {
    try {
      const res = await fetch(`${BASE}/sessions/${instanceKey}`, {
        headers: this.headers(token),
        cache: 'no-store',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.error) return { qrCode: null, status: 'error' };
      const connected = data?.status === 'CONNECTED' || data?.connected === true;
      const qrCode = data?.qrCode || data?.QRCode || null;
      if (connected) return { qrCode: null, status: 'connected' };
      if (qrCode) return { qrCode, status: 'pending' };
      return { qrCode: null, status: 'disconnected' };
    } catch {
      logger.error('WaSender getQRCode failed', { instanceKey });
      return { qrCode: null, status: 'error' };
    }
  }

  async sendMessage(instanceKey: string, token: string, to: string, body: string): Promise<boolean> {
    try {
      const res = await fetch(`${BASE}/send-message`, {
        method: 'POST',
        headers: this.headers(token),
        body: JSON.stringify({
          sessionId: instanceKey,
          to: to.includes('@') ? to : `${to}@c.us`,
          text: body,
        }),
      });
      return res.ok;
    } catch {
      logger.error('WaSender sendMessage failed', { instanceKey });
      return false;
    }
  }

  async checkStatus(instanceKey: string, token: string): Promise<'connected' | 'disconnected' | 'pending'> {
    try {
      const res = await fetch(`${BASE}/sessions/${instanceKey}`, {
        headers: this.headers(token),
        cache: 'no-store',
      });
      const data = await res.json();
      return data?.status === 'CONNECTED' || data?.connected ? 'connected' : 'disconnected';
    } catch {
      return 'disconnected';
    }
  }

  async disconnect(instanceKey: string, token: string): Promise<boolean> {
    try {
      const res = await fetch(`${BASE}/sessions/${instanceKey}/disconnect`, {
        method: 'POST',
        headers: this.headers(token),
      });
      return res.ok;
    } catch {
      return false;
    }
  }
}
