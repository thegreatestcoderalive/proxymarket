// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  hashPassword,
  createSession,
  setSessionCookie,
  validateEmail,
  validatePassword,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, username, password } = body;

    if (!email || !username || !password) {
      return NextResponse.json(
        { success: false, error: "All fields are required" },
        { status: 400 }
      );
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email address" },
        { status: 400 }
      );
    }

    const { valid, errors } = validatePassword(password);
    if (!valid) {
      return NextResponse.json(
        { success: false, error: errors[0] },
        { status: 400 }
      );
    }

    if (!/^[a-zA-Z0-9_-]{3,20}$/.test(username)) {
      return NextResponse.json(
        { success: false, error: "Username must be 3-20 alphanumeric characters" },
        { status: 400 }
      );
    }

    const [existingEmail, existingUsername] = await Promise.all([
      db.user.findUnique({ where: { email: email.toLowerCase() } }),
      db.user.findUnique({ where: { username: username.toLowerCase() } }),
    ]);

    if (existingEmail) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists" },
        { status: 409 }
      );
    }
    if (existingUsername) {
      return NextResponse.json(
        { success: false, error: "Username is already taken" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const user = await db.user.create({
      data: {
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        passwordHash,
      },
    });

    const token = await createSession(user.id);
    setSessionCookie(token);

    return NextResponse.json(
      {
        success: true,
        data: {
          user: { id: user.id, email: user.email, username: user.username, role: user.role },
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[register]", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
