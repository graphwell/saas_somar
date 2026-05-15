import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }
  const userId = (session.user as any).id;

  const agent = await prisma.agent.findFirst({ where: { userId } });
  if (!agent) return NextResponse.json({ error: 'Nenhum agente configurado' }, { status: 404 });

  const updated = await prisma.agent.update({
    where: { id: agent.id },
    data: { isActive: !agent.isActive },
  });

  return NextResponse.json({ isActive: updated.isActive });
}
