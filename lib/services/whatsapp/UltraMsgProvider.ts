import { IWhatsAppProvider, QRCodeResult } from './IWhatsAppProvider';
import { logger } from '@/lib/logger';

const BASE = 'https://api.ultramsg.com';

export class UltraMsgProvider implements IWhatsAppProvider {
  async getQRCode(instanceKey: string, token: string): Promise<QRCodeResult> {
    try {
      const [statusRes, qrRes] = await Promise.all([
        fetch(`${BASE}/${instanceKey}/instance/status?token=${token}`, { cache: 'no-store' }),
        fetch(`${BASE}/${instanceKey}/instance/qr?token=${token}`, { cache: 'no-store' }),
      ]);

      const statusData = await statusRes.json().catch(() => ({}));
      const qrData = await qrRes.json().catch(() => ({}));

      if (!statusRes.ok || statusData?.error) {
        logger.warn('UltraMsg status error', { instanceKey, error: statusData?.error });
        return { qrCode: null, status: 'error' };
      }

      const raw = statusData?.status?.accountStatus?.substatus ?? statusData?.status ?? '';
      const connected = ['authenticated', 'connected', 'normal'].includes(String(raw).toLowerCase());

      if (connected) return { qrCode: null, status: 'connected' };
      if (qrData?.QRCode) return { qrCode: qrData.QRCode, status: 'pending' };
      return { qrCode: null, status: 'disconnected' };
    } catch (e) {
      logger.error('UltraMsg getQRCode failed', { instanceKey });
      return { qrCode: null, status: 'error' };
    }
  }

  async sendMessage(instanceKey: string, token: string, to: string, body: string): Promise<boolean> {
    try {
      const res = await fetch(`${BASE}/${instanceKey}/messages/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          token,
          to: to.includes('@') ? to : `${to}@c.us`,
          body,
        }).toString(),
      });
      return res.ok;
    } catch {
      logger.error('UltraMsg sendMessage failed', { instanceKey });
      return false;
    }
  }

  async checkStatus(instanceKey: string, token: string): Promise<'connected' | 'disconnected' | 'pending'> {
    try {
      const res = await fetch(`${BASE}/${instanceKey}/instance/status?token=${token}`, { cache: 'no-store' });
      const data = await res.json();
      const raw = data?.status?.accountStatus?.substatus ?? data?.status ?? '';
      if (['authenticated', 'connected', 'normal'].includes(String(raw).toLowerCase())) return 'connected';
      return 'disconnected';
    } catch {
      return 'disconnected';
    }
  }

  async disconnect(instanceKey: string, token: string): Promise<boolean> {
    try {
      const res = await fetch(`${BASE}/${instanceKey}/instance/logout?token=${token}`, {
        method: 'POST',
        cache: 'no-store',
      });
      return res.ok;
    } catch {
      return false;
    }
  }
}
