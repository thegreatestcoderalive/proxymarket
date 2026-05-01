// src/app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { clearSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("pm_session")?.value;
    if (token) {
      await db.session.deleteMany({ where: { token } });
    }
    clearSessionCookie();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[logout]", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
