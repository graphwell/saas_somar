import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/require-admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;
  try {
    const logs = await prisma.agentAuditLog.findMany({
      take: 60,
      orderBy: { createdAt: 'desc' },
      include: {
        agent: {
          select: {
            name: true,
            user: { select: { name: true, email: true } },
          },
        },
      },
    });
    return NextResponse.json(logs);
  } catch {
    return NextResponse.json({ error: 'Erro ao buscar logs' }, { status: 500 });
  }
}
