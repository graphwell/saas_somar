import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ inQueue: false });

  const entry = await prisma.waitingQueue.findUnique({ where: { userId: user.id } });
  if (!entry) return NextResponse.json({ inQueue: false });

  const position = await prisma.waitingQueue.count({
    where: { createdAt: { lte: entry.createdAt } },
  });

  return NextResponse.json({ inQueue: true, position, type: entry.type });
}
