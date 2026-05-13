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
    select: {
      instanceKey: true,
      token: true,
      provider: true,
      plan: true,
      messageCount: true,
    },
  });

  if (!instance) {
    return NextResponse.json({
      hasInstance: false,
      status: 'no_instance',
      connected: false,
    });
  }

  // Delega ao endpoint de QR para obter status real do provedor
  return NextResponse.json({
    hasInstance: true,
    instanceKey: instance.instanceKey,
    provider: instance.provider,
    plan: instance.plan,
    messageCount: instance.messageCount,
    status: 'pending', // página vai buscar /api/user/whatsapp/qr separadamente
    connected: false,
  });
}
