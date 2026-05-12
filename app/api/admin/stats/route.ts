import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/require-admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;
  try {
    const [
      totalUsers,
      activeInstances,
      idleInstances,
      paidSubscriptions,
      recentUsers,
      allUsers,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.whatsAppInstance.count({ where: { status: 'IN_USE' } }),
      prisma.whatsAppInstance.count({ where: { status: 'IDLE' } }),
      prisma.subscription.count({ where: { planType: { not: 'trial' }, status: 'active' } }),
      prisma.user.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        where: { role: 'USER' },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          subscription: { select: { planType: true, status: true } },
        },
      }),
      prisma.user.findMany({
        where: { role: 'USER' },
        select: { createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    // Cadastros por mês (últimos 6 meses)
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      return { label: d.toLocaleDateString('pt-BR', { month: 'short' }), year: d.getFullYear(), month: d.getMonth(), count: 0 };
    });
    for (const u of allUsers) {
      const d = new Date(u.createdAt);
      const m = months.find(m => m.year === d.getFullYear() && m.month === d.getMonth());
      if (m) m.count++;
    }

    return NextResponse.json({
      totalUsers,
      activeInstances,
      idleInstances,
      paidSubscriptions,
      trialUsers: totalUsers - paidSubscriptions,
      recentUsers,
      monthlySignups: months.map(m => ({ name: m.label, cadastros: m.count })),
    });
  } catch (err) {
    console.error('[ADMIN_STATS]', err);
    return NextResponse.json({ error: 'Erro ao buscar stats' }, { status: 500 });
  }
}
