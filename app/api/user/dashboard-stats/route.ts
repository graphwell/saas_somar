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
    const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [totalCustomers, activeSessions, subscription, recentSessions, weekMessages] =
      await Promise.all([
        prisma.customer.count({ where: { userId } }),
        prisma.chatSession.count({ where: { customer: { userId }, status: 'active' } }),
        prisma.subscription.findUnique({ where: { userId } }),
        prisma.chatSession.findMany({
          where: { customer: { userId } },
          orderBy: { updatedAt: 'desc' },
          take: 5,
          include: {
            customer: { select: { name: true, phone: true } },
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
              select: { content: true, createdAt: true },
            },
          },
        }),
        prisma.message.findMany({
          where: {
            session: { customer: { userId } },
            createdAt: { gte: since7d },
          },
          select: { createdAt: true, role: true },
        }),
      ]);

    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
    const weeklyData = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const key = d.toDateString();
      const dayMsgs = weekMessages.filter(m => new Date(m.createdAt).toDateString() === key);
      return {
        name: dayNames[d.getDay()],
        msgs: dayMsgs.filter(m => m.role === 'user').length,
        respostas: dayMsgs.filter(m => m.role === 'assistant').length,
      };
    });

    return NextResponse.json({
      totalCustomers,
      activeSessions,
      messagesUsed: subscription?.messagesUsed ?? 0,
      messagesLimit: subscription?.messagesLimit ?? 100,
      tokensUsed: subscription?.tokensUsed ?? 0,
      tokensLimit: subscription?.tokensLimit ?? 100000,
      planType: subscription?.planType ?? 'trial',
      periodEnd: subscription?.currentPeriodEnd ?? null,
      recentSessions,
      weeklyData,
    });
  } catch (err) {
    console.error('[DASHBOARD_STATS]', err);
    return NextResponse.json({ error: 'Erro ao buscar stats' }, { status: 500 });
  }
}
