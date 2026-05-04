import Stripe from 'stripe';

// Guard: Stripe will be undefined if key is missing — fail gracefully instead of crashing on startup
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2026-03-25.dahlia',
      typescript: true,
    })
  : null;

/**
 * Returns the Stripe instance, throwing a descriptive error if not configured.
 * Use this in API routes that require Stripe to be active.
 */
export function getStripe(): Stripe {
  if (!stripe) {
    throw new Error(
      'Stripe não está configurado. Defina STRIPE_SECRET_KEY no .env'
    );
  }
  return stripe;
}
