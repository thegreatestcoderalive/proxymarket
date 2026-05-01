// src/app/api/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { createCheckoutSession } from "@/lib/stripe";
import { getBaseUrl } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { productSlug } = await req.json();
    if (!productSlug) {
      return NextResponse.json({ success: false, error: "productSlug required" }, { status: 400 });
    }

    const product = await db.product.findUnique({ where: { slug: productSlug, isActive: true } });
    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    const order = await db.order.create({
      data: {
        userId: user.id,
        productId: product.id,
        amountTotal: product.price,
        status: "PENDING",
      },
    });

    const base = getBaseUrl();
    const session = await createCheckoutSession({
      productId: product.id,
      productName: product.name,
      price: product.price,
      billingPeriod: product.billingPeriod,
      stripePriceId: product.stripePriceId,
      userId: user.id,
      orderId: order.id,
      successUrl: `${base}/checkout/success?order=${order.id}`,
      cancelUrl: `${base}/products`,
    });

    await db.order.update({
      where: { id: order.id },
      data: { stripeSessionId: session.id },
    });

    return NextResponse.json({ success: true, data: { url: session.url } });
  } catch (err) {
    console.error("[orders POST]", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const orders = await db.order.findMany({
      where: { userId: user.id },
      include: { product: { select: { name: true, proxyType: true, billingPeriod: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: orders });
  } catch (err) {
    console.error("[orders GET]", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
