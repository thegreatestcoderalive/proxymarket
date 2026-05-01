// src/types/index.ts

export type { User, Product, Order, License } from "@prisma/client";
export { ProxyType, BillingPeriod, OrderStatus, LicenseStatus, Role } from "@prisma/client";

// ─── API Response wrapper ─────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ─── Proxy type metadata (for UI display) ────────────────
export interface ProxyTypeMeta {
  type: import("@prisma/client").ProxyType;
  label: string;
  tagline: string;
  color: string;        // Tailwind color class or hex
  icon: string;         // emoji / svg id
  architecture: string;
  useCases: string[];
}

export const PROXY_TYPE_META: Record<string, ProxyTypeMeta> = {
  ULTRAVIOLET: {
    type: "ULTRAVIOLET",
    label: "Ultraviolet",
    tagline: "Service worker proxy with client-side TLS",
    color: "#6366f1",
    icon: "🔷",
    architecture: "Service Worker",
    useCases: ["General browsing", "Streaming", "Social media"],
  },
  RAMMERHEAD: {
    type: "RAMMERHEAD",
    label: "Rammerhead",
    tagline: "URL-obfuscated rewriting proxy with session isolation",
    color: "#E8502A",
    icon: "🐏",
    architecture: "Rewriting Proxy",
    useCases: ["High-stealth", "Filtered networks", "Shared devices"],
  },
  DYNAMIC: {
    type: "DYNAMIC",
    label: "Dynamic",
    tagline: "Bare-metal server proxy with rotating IPs",
    color: "#2DD4A0",
    icon: "⚡",
    architecture: "Bare Server",
    useCases: ["Automation", "Scraping", "High-volume"],
  },
  METEOR: {
    type: "METEOR",
    label: "Meteor",
    tagline: "WebSocket-first edge proxy for real-time apps",
    color: "#F5A623",
    icon: "☄️",
    architecture: "Edge WebSocket",
    useCases: ["Real-time apps", "Video calls", "Live data"],
  },
  WISP: {
    type: "WISP",
    label: "WISP",
    tagline: "TCP/UDP tunneling via WebSocket protocol",
    color: "#A855F7",
    icon: "🌐",
    architecture: "Protocol Tunnel",
    useCases: ["Any port", "Gaming", "Raw protocols"],
  },
  BARE_SERVER: {
    type: "BARE_SERVER",
    label: "Bare Server",
    tagline: "Minimal HTTP/HTTPS bare server implementation",
    color: "#64748b",
    icon: "🖥️",
    architecture: "Bare Server",
    useCases: ["Developer use", "Custom integrations"],
  },
};

// ─── Session / Auth ───────────────────────────────────────
export interface SessionUser {
  id: string;
  email: string;
  username: string;
  role: import("@prisma/client").Role;
}

// ─── Cart / Checkout ─────────────────────────────────────
export interface CheckoutItem {
  productId: string;
  quantity: 1;
}

// ─── Dashboard ───────────────────────────────────────────
export interface DashboardStats {
  totalOrders: number;
  activeLicenses: number;
  totalSpend: number; // cents
}

// ─── License verification payload (for API consumers) ────
export interface LicenseVerifyRequest {
  key: string;
  hwid?: string;
}

export interface LicenseVerifyResponse {
  valid: boolean;
  license?: {
    key: string;
    status: string;
    product: string;
    expiresAt: string | null;
    activationsLeft: number;
  };
  error?: string;
}
