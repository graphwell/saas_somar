import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getStripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';
import { migrateTrialToPaid } from '@/lib/services/migrationService';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';

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
    return NextResponse.json({ error: 'Stripe-Signature ausente' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    logger.error('Stripe webhook signature invalid', {});
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Idempotência — ignora eventos já processados
  const existing = await prisma.stripeEvent.findUnique({ where: { id: event.id } });
  if (existing) {
    return NextResponse.json({ received: true, skipped: true });
  }
  await prisma.stripeEvent.create({ data: { id: event.id, type: event.type } });

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        if (!userId) {
          logger.warn('Stripe checkout: userId missing', {});
          break;
        }
        await prisma.subscription.upsert({
          where: { userId },
          create: {
            userId,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            status: 'active',
            planType: 'pro',
            messagesLimit: 999999,
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
          update: {
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            status: 'active',
            planType: 'pro',
          },
        });
        const result = await migrateTrialToPaid(userId);
        if (!result.success) {
          logger.warn('Migration failed after checkout', { userId, reason: result.reason });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        await prisma.subscription.update({
          where: { stripeSubscriptionId: sub.id },
          data: { status: sub.status as string },
        }).catch(() => {});
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        await prisma.subscription.update({
          where: { stripeSubscriptionId: sub.id },
          data: { planType: 'trial', status: 'canceled', stripeSubscriptionId: null },
        }).catch(() => {});
        // Libera instância paga de volta ao pool
        const dbSub = await prisma.subscription.findFirst({ where: { stripeCustomerId: (sub.customer as string) } });
        if (dbSub) {
          await prisma.whatsAppInstance.updateMany({
            where: { userId: dbSub.userId, plan: 'PAID', status: 'IN_USE' },
            data: { status: 'IDLE', userId: null },
          });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subId = (invoice as any).parent?.subscription_details?.subscription
          ?? (invoice as any).subscription as string;
        if (subId) {
          await prisma.subscription.update({
            where: { stripeSubscriptionId: subId },
            data: { status: 'past_due' },
          }).catch(() => {});
        }
        await prisma.adminNotification.create({
          data: {
            type: 'PAID_POOL_LOW',
            message: `Pagamento falhou para cliente Stripe: ${(invoice as any).customer_email ?? 'desconhecido'}`,
          },
        }).catch(() => {});
        break;
      }

      case 'customer.subscription.trial_will_end': {
        const sub = event.data.object as Stripe.Subscription;
        logger.info('Trial will end', { subId: sub.id });
        break;
      }
    }
  } catch (err) {
    logger.error('Stripe webhook handler error', { eventType: event.type });
    return NextResponse.json({ received: true, warning: 'Handler error' });
  }

  return NextResponse.json({ received: true });
}
