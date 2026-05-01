// src/app/api/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type")?.toUpperCase();
    const billing = searchParams.get("billing")?.toUpperCase();

    const where: Record<string, unknown> = { isActive: true };
    if (type) where.proxyType = type;
    if (billing) where.billingPeriod = billing;

    const products = await db.product.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { price: "asc" }],
    });

    return NextResponse.json({ success: true, data: products });
  } catch (err) {
    console.error("[products GET]", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
