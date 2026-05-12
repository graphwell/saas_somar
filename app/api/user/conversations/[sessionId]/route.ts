import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(_req: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  const userId = (session.user as any).id;
  const { sessionId } = await params;

  try {
    const chatSession = await prisma.chatSession.findFirst({
      where: { id: sessionId, customer: { userId } },
      include: {
        customer: { select: { name: true, phone: true } },
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!chatSession) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 });
    return NextResponse.json(chatSession);
  } catch {
    return NextResponse.json({ error: 'Erro ao buscar mensagens' }, { status: 500 });
  }
}
