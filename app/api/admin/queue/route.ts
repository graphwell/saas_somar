import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/require-admin';
import { assignInstanceToUser } from '@/lib/services/instanceService';

export const dynamic = 'force-dynamic';

export async function GET() {
  const err = await requireAdmin();
  if (err) return err;

  const queue = await prisma.waitingQueue.findMany({
    include: {
      user: { select: { name: true, email: true, createdAt: true } },
    },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json(queue);
}

export async function POST(request: Request) {
  const err = await requireAdmin();
  if (err) return err;

  const { userId, instanceId } = await request.json();
  if (!userId || !instanceId) {
    return NextResponse.json({ error: 'userId e instanceId são obrigatórios' }, { status: 400 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.whatsAppInstance.update({
      where: { id: instanceId },
      data: { status: 'IN_USE', userId },
    });
    await tx.waitingQueue.deleteMany({ where: { userId } });
  });

  return NextResponse.json({ success: true });
}
