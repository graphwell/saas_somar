import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  const userId = (session.user as any).id;

  try {
    const sessions = await prisma.chatSession.findMany({
      where: { customer: { userId } },
      include: {
        customer: { select: { name: true, phone: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { content: true, role: true, createdAt: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 60,
    });
    return NextResponse.json(sessions);
  } catch {
    return NextResponse.json({ error: 'Erro ao buscar conversas' }, { status: 500 });
  }
}
