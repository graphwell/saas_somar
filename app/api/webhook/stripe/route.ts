import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getStripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

export async function POST(req: Request) {
  let stripe: Stripe;
  try {
    stripe = getStripe();
  } catch {
    return NextResponse.json({ error: 'Stripe não configurado' }, { status: 503 });
  }

  const body = await req.text();
  const signature = (await headers()).get('Stripe-Signature') as string;

  if (!signature) {
    return NextResponse.json({ error: 'Stripe-Signature header ausente' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err: any) {
    console.error('STRIPE_WEBHOOK_SIGNATURE_ERROR:', err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const stripeSubscriptionId = session.subscription as string;
        const stripeCustomerId = session.customer as string;

        if (!userId) {
          console.error('STRIPE_WEBHOOK: userId não encontrado no metadata da sessão', session.id);
          break;
        }

        const { WhatsappService } = await import('@/lib/services/whatsapp.service');

        await prisma.subscription.upsert({
            where: { userId },
            create: {
                userId,
                stripeCustomerId,
                stripeSubscriptionId,
                status: 'active',
                planType: 'pro',
                messagesLimit: 1000, // limite fictício pro
                messagesUsed: 0,
                currentPeriodStart: new Date(),
                currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            },
            update: {
                stripeCustomerId,
                stripeSubscriptionId,
                status: 'active',
                planType: 'pro',
            }
        });

        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await prisma.subscription.update({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            status: subscription.status as any,
          },
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await prisma.subscription.update({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            planType: 'trial',
            status: 'canceled',
            stripeSubscriptionId: null,
          },
        });
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        // Na versão atual do SDK, subscription fica em parent.subscription_details
        const parent = (invoice as any).parent;
        const subscriptionId: string | undefined =
          parent?.subscription_details?.subscription ||
          parent?.subscription;

        if (subscriptionId) {
          await prisma.subscription.update({
            where: { stripeSubscriptionId: subscriptionId },
            data: { status: 'past_due' },
          });
        }
        break;
      }

      default:
        // Ignorar eventos não mapeados — isso é intencional
        break;
    }
  } catch (err) {
    console.error(`STRIPE_WEBHOOK_HANDLER_ERROR [${event.type}]:`, err);
    // Retornar 200 mesmo em erro de DB para Stripe não retentar indefinidamente
    // Log o erro para investigação posterior
    return NextResponse.json({ received: true, warning: 'Handler error — check logs' });
  }

  return NextResponse.json({ received: true });
}

