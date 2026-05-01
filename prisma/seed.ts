// prisma/seed.ts
import { PrismaClient, ProxyType, BillingPeriod } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing products
  await prisma.product.deleteMany();

  const products = [
    // ── Ultraviolet ──────────────────────────────────────────
    {
      slug: "ultraviolet-monthly",
      name: "Ultraviolet Monthly",
      description: "The gold-standard service worker proxy. Bypass content filters with full TLS encryption.",
      longDescription:
        "Ultraviolet is our most popular proxy solution — a sophisticated service worker-based proxy that handles TLS locally within the browser. Zero server-side decryption means your traffic is never exposed. Supports WebSockets, streaming media, and dynamic content out of the box.",
      proxyType: ProxyType.ULTRAVIOLET,
      billingPeriod: BillingPeriod.MONTHLY,
      price: 799,
      features: [
        "Service worker architecture",
        "Full TLS handling",
        "WebSocket support",
        "Streaming media",
        "Custom domain routing",
        "Email support",
      ],
      bandwidth: "Unlimited",
      connections: 3,
      speed: "1Gbps",
      regions: ["US", "EU", "ASIA"],
      isActive: true,
      isFeatured: false,
      sortOrder: 1,
    },
    {
      slug: "ultraviolet-yearly",
      name: "Ultraviolet Yearly",
      description: "Ultraviolet at our best annual rate. Save 35% vs monthly billing.",
      proxyType: ProxyType.ULTRAVIOLET,
      billingPeriod: BillingPeriod.YEARLY,
      price: 6299,
      features: [
        "Service worker architecture",
        "Full TLS handling",
        "WebSocket support",
        "Streaming media",
        "Custom domain routing",
        "Priority email support",
        "2 months free",
      ],
      bandwidth: "Unlimited",
      connections: 5,
      speed: "1Gbps",
      regions: ["US", "EU", "ASIA", "LATAM"],
      isActive: true,
      isFeatured: true,
      sortOrder: 2,
    },

    // ── Rammerhead ───────────────────────────────────────────
    {
      slug: "rammerhead-monthly",
      name: "Rammerhead Monthly",
      description: "A fast, rewriting proxy with URL obfuscation and session isolation for maximum stealth.",
      longDescription:
        "Rammerhead takes a different approach — every URL is obfuscated through a custom encoding layer, making it nearly impossible for network-level filters to identify proxied traffic. Session isolation ensures no cross-contamination between browsing contexts.",
      proxyType: ProxyType.RAMMERHEAD,
      billingPeriod: BillingPeriod.MONTHLY,
      price: 699,
      features: [
        "URL obfuscation engine",
        "Session isolation",
        "Rewriting proxy architecture",
        "Cookie jar management",
        "HTTPS everywhere",
        "Email support",
      ],
      bandwidth: "Unlimited",
      connections: 3,
      speed: "2Gbps",
      regions: ["US", "EU"],
      isActive: true,
      isFeatured: false,
      sortOrder: 3,
    },
    {
      slug: "rammerhead-lifetime",
      name: "Rammerhead Lifetime",
      description: "One-time payment. Yours forever. The best value for power users.",
      proxyType: ProxyType.RAMMERHEAD,
      billingPeriod: BillingPeriod.LIFETIME,
      price: 4999,
      features: [
        "URL obfuscation engine",
        "Session isolation",
        "Rewriting proxy architecture",
        "Cookie jar management",
        "HTTPS everywhere",
        "Lifetime updates",
        "Priority support",
        "Early access features",
      ],
      bandwidth: "Unlimited",
      connections: 10,
      speed: "2Gbps",
      regions: ["US", "EU", "ASIA", "LATAM", "AU"],
      isActive: true,
      isFeatured: true,
      sortOrder: 4,
    },

    // ── Dynamic (Bare Server) ─────────────────────────────────
    {
      slug: "dynamic-monthly",
      name: "Dynamic Monthly",
      description: "Bare-metal server proxy with dynamic IP rotation. Ideal for enterprise and automation.",
      longDescription:
        "Our Dynamic proxy tier runs on dedicated bare-metal infrastructure with automated IP rotation across our global pool. Designed for high-throughput automated workloads where residential IPs and service workers aren't viable.",
      proxyType: ProxyType.DYNAMIC,
      billingPeriod: BillingPeriod.MONTHLY,
      price: 1499,
      features: [
        "Dynamic IP rotation",
        "Bare-metal infrastructure",
        "API key authentication",
        "10K requests/day",
        "Uptime SLA 99.9%",
        "Slack support",
      ],
      bandwidth: "500GB",
      connections: 25,
      speed: "10Gbps",
      regions: ["US", "EU", "ASIA", "LATAM", "AU"],
      isActive: true,
      isFeatured: false,
      sortOrder: 5,
    },

    // ── Meteor ───────────────────────────────────────────────
    {
      slug: "meteor-monthly",
      name: "Meteor Monthly",
      description: "Next-gen WebSocket-first proxy optimised for real-time apps and low-latency browsing.",
      longDescription:
        "Meteor is built ground-up for the modern web. WebSocket-first architecture means latency stays sub-50ms across our edge network. Perfect for video calls, live trading dashboards, or any real-time application that breaks under traditional proxies.",
      proxyType: ProxyType.METEOR,
      billingPeriod: BillingPeriod.MONTHLY,
      price: 999,
      features: [
        "WebSocket-first architecture",
        "Sub-50ms latency",
        "Real-time app support",
        "Edge network routing",
        "Video/audio passthrough",
        "Discord support",
      ],
      bandwidth: "Unlimited",
      connections: 5,
      speed: "5Gbps",
      regions: ["US", "EU", "ASIA"],
      isActive: true,
      isFeatured: false,
      sortOrder: 6,
    },

    // ── WISP ─────────────────────────────────────────────────
    {
      slug: "wisp-monthly",
      name: "WISP Monthly",
      description: "Protocol-level proxy over WebSockets. Handles TCP and UDP through any browser.",
      longDescription:
        "WISP (WebSocket Internet Session Protocol) operates at a lower level than HTTP proxies — tunneling raw TCP and UDP over a single WebSocket connection. Access any port, any protocol, through a standard browser with zero native client installation required.",
      proxyType: ProxyType.WISP,
      billingPeriod: BillingPeriod.MONTHLY,
      price: 1199,
      features: [
        "TCP + UDP tunneling",
        "Any-port access",
        "Zero client install",
        "WebSocket transport",
        "Low-level protocol support",
        "Priority support",
      ],
      bandwidth: "Unlimited",
      connections: 8,
      speed: "5Gbps",
      regions: ["US", "EU"],
      isActive: true,
      isFeatured: false,
      sortOrder: 7,
    },
  ];

  for (const product of products) {
    await prisma.product.create({ data: product });
  }

  console.log(`✅ Seeded ${products.length} products`);

const hash = await bcrypt.hash("admin1234", 12);

  await prisma.user.upsert({
    where: { email: "admin@proxymarket.dev" },
    update: {},
    create: {
      email: "admin@proxymarket.dev",
      username: "admin",
      passwordHash: hash,
      role: "ADMIN",
    },
  });

  console.log("✅ Admin user: admin@proxymarket.dev / admin1234");
  console.log("🎉 Seed complete");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
