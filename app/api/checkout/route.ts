import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getStripe } from '@/lib/stripe';

export async function POST(req: Request) {
  let stripe;
  try {
    stripe = getStripe();
  } catch {
    return NextResponse.json({ error: 'Pagamentos não disponíveis no momento.' }, { status: 503 });
  }

  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { priceId } = await req.json();

    if (!priceId || typeof priceId !== 'string') {
      return NextResponse.json({ error: 'Price ID inválido ou ausente' }, { status: 400 });
    }

    const userId = (session.user as any).id as string;

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/plano?canceled=true`,
      metadata: {
        userId,
      },
      customer_email: session.user.email || undefined,
    });

    return NextResponse.json({ url: checkoutSession.url });

  } catch (err) {
    console.error('STRIPE_CHECKOUT_ERROR:', err);
    return NextResponse.json({ error: 'Erro ao criar checkout' }, { status: 500 });
  }
}

