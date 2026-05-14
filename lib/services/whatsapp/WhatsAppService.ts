import { WhatsAppInstance } from '@prisma/client';
import { IWhatsAppProvider } from './IWhatsAppProvider';
import { UltraMsgProvider } from './UltraMsgProvider';
import { WaSenderProvider } from './WaSenderProvider';

function getProvider(provider: string): IWhatsAppProvider {
  switch (provider.toUpperCase()) {
    case 'ULTRAMSG': return new UltraMsgProvider();
    case 'WASENDER': return new WaSenderProvider();
    default: throw new Error(`Unknown provider: ${provider}`);
  }
}

export const getQRCode = (i: WhatsAppInstance) =>
  getProvider(i.provider).getQRCode(i.instanceKey, i.token);

export const sendMessage = (i: WhatsAppInstance, to: string, body: string) =>
  getProvider(i.provider).sendMessage(i.instanceKey, i.token, to, body);

export const disconnectInstance = (i: WhatsAppInstance) =>
  getProvider(i.provider).disconnect(i.instanceKey, i.token);

export const checkInstanceHealth = async (i: WhatsAppInstance): Promise<boolean> => {
  try {
    return (await getProvider(i.provider).checkStatus(i.instanceKey, i.token)) === 'connected';
  } catch {
    return false;
  }
};
