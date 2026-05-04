import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _: Request,
  { params }: { params: Promise<{ instance: string }> }
) {
  try {
    const resolvedParams = await params;
    const instance = await prisma.whatsAppInstance.findUnique({
      where: { instanceKey: resolvedParams.instance },
      select: { status: true }
    });

    if (!instance) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ status: instance.status });
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
