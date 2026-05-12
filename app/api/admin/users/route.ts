import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: { role: 'USER' },
      select: {
        id: true,
        name: true,
        email: true,
        subscription: { select: { planType: true, status: true } },
        instances: { select: { id: true } },
      },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(users);
  } catch {
    return NextResponse.json({ error: 'Erro ao buscar usuários' }, { status: 500 });
  }
}
