// src/lib/license.ts
import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import type { LicenseVerifyResponse } from "@/types";

// ─── Key format: PXMKT-XXXXX-XXXXX-XXXXX-XXXXX ─────────────
const PREFIX = "PXMKT";

export function generateLicenseKey(): string {
  const segments = Array.from({ length: 4 }, () =>
    randomBytes(3).toString("hex").toUpperCase().slice(0, 5)
  );
  return `${PREFIX}-${segments.join("-")}`;
}

// ─── Create license after successful payment ─────────────
export async function createLicense({
  userId,
  productId,
  orderId,
  expiresAt,
  maxActivations = 1,
}: {
  userId: string;
  productId: string;
  orderId: string;
  expiresAt?: Date;
  maxActivations?: number;
}) {
  let key = generateLicenseKey();

  // Ensure uniqueness (collision is astronomically unlikely but handle it)
  let attempts = 0;
  while (attempts < 5) {
    const existing = await db.license.findUnique({ where: { key } });
    if (!existing) break;
    key = generateLicenseKey();
    attempts++;
  }

  return db.license.create({
    data: {
      key,
      userId,
      productId,
      orderId,
      expiresAt,
      maxActivations,
    },
  });
}

// ─── Verify a license key (public API endpoint) ─────────
export async function verifyLicense(
  key: string,
  hwid?: string,
  ip?: string
): Promise<LicenseVerifyResponse> {
  const license = await db.license.findUnique({
    where: { key },
    include: { product: true },
  });

  if (!license) {
    return { valid: false, error: "License key not found" };
  }

  if (license.status === "REVOKED") {
    return { valid: false, error: "License has been revoked" };
  }

  if (license.status === "SUSPENDED") {
    return { valid: false, error: "License is suspended" };
  }

  if (license.expiresAt && license.expiresAt < new Date()) {
    await db.license.update({
      where: { id: license.id },
      data: { status: "EXPIRED" },
    });
    return { valid: false, error: "License has expired" };
  }

  // HWID binding: if already bound to a different HWID, reject
  if (hwid && license.hwid && license.hwid !== hwid) {
    await db.activationLog.create({
      data: { licenseId: license.id, ip, hwid, success: false },
    });
    return { valid: false, error: "License is bound to a different device" };
  }

  // Bind HWID on first use
  if (hwid && !license.hwid) {
    await db.license.update({
      where: { id: license.id },
      data: { hwid, activations: { increment: 1 }, lastUsedAt: new Date() },
    });
  } else {
    await db.license.update({
      where: { id: license.id },
      data: { lastUsedAt: new Date() },
    });
  }

  await db.activationLog.create({
    data: { licenseId: license.id, ip, hwid, success: true },
  });

  return {
    valid: true,
    license: {
      key: license.key,
      status: license.status,
      product: license.product.name,
      expiresAt: license.expiresAt?.toISOString() ?? null,
      activationsLeft: license.maxActivations - license.activations,
    },
  };
}

// ─── Format license key for display ─────────────────────
export function formatLicenseKey(key: string): string {
  return key; // Already formatted
}

export function maskLicenseKey(key: string): string {
  const parts = key.split("-");
  return parts
    .map((p, i) => (i === parts.length - 1 ? p : i === 0 ? p : "•••••"))
    .join("-");
}
