import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/require-admin';
import { prisma } from '@/lib/prisma';
import { checkInstanceHealth } from '@/lib/services/whatsapp/WhatsAppService';

export const dynamic = 'force-dynamic';

export async function GET() {
  const err = await requireAdmin();
  if (err) return err;

  const instances = await prisma.whatsAppInstance.findMany({
    where: { status: 'IN_USE' },
    select: { id: true, instanceKey: true, token: true, provider: true, userId: true, name: true },
  });

  const results = await Promise.all(
    instances.map(async (inst) => ({
      id: inst.id,
      name: inst.name,
      instanceKey: inst.instanceKey,
      provider: inst.provider,
      userId: inst.userId,
      healthy: await checkInstanceHealth(inst as any),
    }))
  );

  return NextResponse.json(results);
}
