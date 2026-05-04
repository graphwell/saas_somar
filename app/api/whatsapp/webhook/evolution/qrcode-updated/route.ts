import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Evolution webhook (qrcode-updated):", body.instance, "QR Code length:", body.data?.qrcode?.base64?.length);

    // Como o sistema front-end busca o QR code da rota /qrcode,
    // nós só logamos isso aqui para confirmação e debug.
    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error('Erro no webhook qrcode-updated:', e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
