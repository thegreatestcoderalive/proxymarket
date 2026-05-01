// src/lib/stripe.ts
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-02-24.acacia",
  typescript: true,
});

// ─── Create checkout session ──────────────────────────────
export async function createCheckoutSession({
  productId,
  productName,
  price,
  billingPeriod,
  stripePriceId,
  userId,
  orderId,
  successUrl,
  cancelUrl,
}: {
  productId: string;
  productName: string;
  price: number;
  billingPeriod: string;
  stripePriceId?: string | null;
  userId: string;
  orderId: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const isRecurring = billingPeriod !== "LIFETIME";

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: isRecurring ? "subscription" : "payment",
    line_items: [
      {
        ...(stripePriceId
          ? { price: stripePriceId }
          : {
              price_data: {
                currency: "usd",
                unit_amount: price,
                product_data: {
                  name: productName,
                  description: `ProxyMarket — ${productName}`,
                },
                ...(isRecurring && {
                  recurring: {
                    interval: billingPeriod === "YEARLY" ? "year" : "month",
                  },
                }),
              },
            }),
        quantity: 1,
      },
    ],
    metadata: {
      userId,
      orderId,
      productId,
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
    client_reference_id: orderId,
  });

  return session;
}

// ─── Verify webhook signature ─────────────────────────────
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(payload, signature, secret);
}
