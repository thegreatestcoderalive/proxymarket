// src/app/api/licenses/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyLicense } from "@/lib/license";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { key, hwid } = body;

    if (!key || typeof key !== "string") {
      return NextResponse.json(
        { success: false, error: "License key required" },
        { status: 400 }
      );
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
      req.headers.get("x-real-ip") ??
      undefined;

    const result = await verifyLicense(key.trim().toUpperCase(), hwid, ip);

    return NextResponse.json(
      { success: result.valid, ...result },
      { status: result.valid ? 200 : 403 }
    );
  } catch (err) {
    console.error("[license/verify]", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
