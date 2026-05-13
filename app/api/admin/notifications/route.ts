import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/require-admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  const notifications = await prisma.adminNotification.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return NextResponse.json({ notifications, unreadCount });
}

export async function PATCH(req: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { id, markAllRead } = await req.json();

  if (markAllRead) {
    await prisma.adminNotification.updateMany({
      where: { read: false },
      data: { read: true },
    });
  } else if (id) {
    await prisma.adminNotification.update({
      where: { id },
      data: { read: true },
    });
  }

  return NextResponse.json({ success: true });
}
