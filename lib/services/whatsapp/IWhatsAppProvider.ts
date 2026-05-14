export interface QRCodeResult {
  qrCode: string | null;
  status: 'connected' | 'disconnected' | 'pending' | 'error';
}

export interface IWhatsAppProvider {
  getQRCode(instanceKey: string, token: string): Promise<QRCodeResult>;
  sendMessage(instanceKey: string, token: string, to: string, body: string): Promise<boolean>;
  checkStatus(instanceKey: string, token: string): Promise<'connected' | 'disconnected' | 'pending'>;
  disconnect(instanceKey: string, token: string): Promise<boolean>;
}
