import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _: Request,
  { params }: { params: { instance: string } }
) {
  try {
    const instance = await prisma.whatsAppInstance.findUnique({
      where: { instanceKey: params.instance },
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
