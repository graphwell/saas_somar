import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  const userId = (session.user as any).id;

  const instance = await prisma.whatsAppInstance.findFirst({
    where: { userId },
    select: { instanceKey: true, token: true, provider: true },
  });

  if (!instance) {
    return NextResponse.json({ error: 'Sem instância', status: 'no_instance' });
  }

  if (instance.provider === 'ULTRAMSG') {
    try {
      // Status
      const statusRes = await fetch(
        `https://api.ultramsg.com/${instance.instanceKey}/instance/status?token=${instance.token}`,
        { cache: 'no-store' }
      );
      const statusData = await statusRes.json();

      // Verifica erro de autenticação
      if (!statusRes.ok || statusData?.error) {
        return NextResponse.json({
          status: 'invalid_credentials',
          error: statusData?.error ?? 'Token inválido ou instância não encontrada no UltraMsg.',
          raw: statusData,
        });
      }

      // Verifica se está conectado
      const rawStatus =
        statusData?.status?.accountStatus?.substatus ??
        statusData?.status?.accountStatus?.status ??
        statusData?.status ?? '';

      const connected = ['authenticated', 'connected', 'normal'].includes(String(rawStatus).toLowerCase());

      if (connected) {
        return NextResponse.json({ status: 'connected', connected: true });
      }

      // Busca QR code
      const qrRes = await fetch(
        `https://api.ultramsg.com/${instance.instanceKey}/instance/qr?token=${instance.token}`,
        { cache: 'no-store' }
      );
      const qrData = await qrRes.json();

      if (qrData?.QRCode) {
        return NextResponse.json({
          status: 'qrCode',
          connected: false,
          qrCode: qrData.QRCode,
        });
      }

      return NextResponse.json({
        status: 'loading',
        connected: false,
        raw: { statusData, qrData },
      });
    } catch (err: any) {
      console.error('[WHATSAPP_QR_ULTRAMSG]', err);
      return NextResponse.json({ status: 'error', error: err.message });
    }
  }

  if (instance.provider === 'WASENDER') {
    try {
      const res = await fetch(
        `https://api.wasender.com/sessions/${instance.instanceKey}`,
        {
          headers: { Authorization: `Bearer ${instance.token}` },
          cache: 'no-store',
        }
      );
      const data = await res.json();

      if (!res.ok || data?.error) {
        return NextResponse.json({
          status: 'invalid_credentials',
          error: data?.error ?? 'Token inválido ou sessão não encontrada no WaSender.',
        });
      }

      const connected = data?.status === 'CONNECTED' || data?.connected === true;
      const qrCode = data?.qrCode || data?.QRCode;

      return NextResponse.json({
        status: connected ? 'connected' : qrCode ? 'qrCode' : 'loading',
        connected,
        qrCode,
      });
    } catch (err: any) {
      console.error('[WHATSAPP_QR_WASENDER]', err);
      return NextResponse.json({ status: 'error', error: err.message });
    }
  }

  return NextResponse.json({ status: 'error', error: 'Provedor não suportado.' });
}
