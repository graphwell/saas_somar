import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Evolution webhook (connection-update):", body);

    const instanceName = body.instance;
    const status = body.data?.state || body.state;

    if (instanceName && status === 'open') {
      await prisma.whatsAppInstance.updateMany({
        where: { instanceKey: instanceName },
        data: { status: 'connected' }
      });
      console.log(`Instância ${instanceName} marcada como conectada.`);
    } else if (instanceName && status === 'close') {
      await prisma.whatsAppInstance.updateMany({
        where: { instanceKey: instanceName },
        data: { status: 'disconnected' }
      });
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error('Erro no webhook connection-update:', e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
