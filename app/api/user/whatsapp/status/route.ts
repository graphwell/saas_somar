import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { WhatsAppFactory } from '@/lib/whatsapp/factory';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  const userId = (session.user as any).id;

  try {
    const instance = await prisma.whatsAppInstance.findFirst({
      where: { userId },
      select: { instanceKey: true, token: true, provider: true, plan: true, messageCount: true },
    });

    if (!instance) {
      return NextResponse.json({
        hasInstance: false,
        connected: false,
        status: 'no_instance',
      });
    }

    // Busca status real no provedor
    const adapter = WhatsAppFactory.getAdapter(instance.provider);
    const providerStatus = await adapter.getInstanceStatus(instance.token, instance.instanceKey);

    return NextResponse.json({
      hasInstance: true,
      instanceKey: instance.instanceKey,
      provider: instance.provider,
      plan: instance.plan,
      messageCount: instance.messageCount,
      ...providerStatus,
    });
  } catch (err) {
    console.error('[WHATSAPP_STATUS]', err);
    return NextResponse.json({ error: 'Erro ao buscar status' }, { status: 500 });
  }
}
