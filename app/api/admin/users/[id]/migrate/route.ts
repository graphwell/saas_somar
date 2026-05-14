import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/require-admin';
import { migrateTrialToPaid } from '@/lib/services/migrationService';

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const err = await requireAdmin();
  if (err) return err;

  const { id } = await params;
  const result = await migrateTrialToPaid(id);

  if (!result.success) {
    return NextResponse.json({ error: result.reason }, { status: 400 });
  }

  return NextResponse.json({ success: true, paidInstanceId: result.paidInstanceId });
}
