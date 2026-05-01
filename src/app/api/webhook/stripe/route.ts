// src/app/api/webhook/stripe/route.ts
import { NextRequest, NextResponse } from "next/server";
import { constructWebhookEvent } from "@/lib/stripe";
import { db } from "@/lib/db";
import { createLicense } from "@/lib/license";
import type Stripe from "stripe";


export async function POST(req: NextRequest) {
  const payload = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = constructWebhookEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("[webhook] signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await handleSubscriptionCanceled(sub);
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error(`[webhook] handler error for ${event.type}`, err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const { orderId, userId, productId } = session.metadata ?? {};
  if (!orderId || !userId || !productId) {
    console.error("[webhook] missing metadata", session.metadata);
    return;
  }

  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order || order.status === "COMPLETED") return;

  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product) return;

  await db.order.update({
    where: { id: orderId },
    data: {
      status: "COMPLETED",
      stripePaymentId:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.subscription?.toString(),
    },
  });

  // Calculate expiry
  let expiresAt: Date | undefined;
  if (product.billingPeriod === "MONTHLY") {
    expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  } else if (product.billingPeriod === "YEARLY") {
    expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
  }

  await createLicense({ userId, productId, orderId, expiresAt });
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const subId = typeof invoice.subscription === "string" ? invoice.subscription : null;
  if (!subId) return;

  const order = await db.order.findFirst({
    where: { stripePaymentId: subId },
  });
  if (!order) return;

  const license = await db.license.findUnique({ where: { orderId: order.id } });
  if (license) {
    await db.license.update({ where: { id: license.id }, data: { status: "SUSPENDED" } });
  }
}

async function handleSubscriptionCanceled(sub: Stripe.Subscription) {
  const order = await db.order.findFirst({ where: { stripePaymentId: sub.id } });
  if (!order) return;

  const license = await db.license.findUnique({ where: { orderId: order.id } });
  if (license) {
    await db.license.update({ where: { id: license.id }, data: { status: "EXPIRED" } });
  }
}
