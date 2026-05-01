// src/app/page.tsx
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";

const PROXY_FEATURES = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 2L17 6V10C17 13.866 13.866 18 10 18C6.134 18 3 13.866 3 10V6L10 2Z" stroke="#E8502A" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M7 10L9 12L13 8" stroke="#E8502A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: "Encrypted Transit",
    desc: "TLS-handled locally or server-side — your traffic never touches an unencrypted hop.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="7" stroke="#E8502A" strokeWidth="1.5"/>
        <path d="M10 3C10 3 7 6.5 7 10C7 13.5 10 17 10 17" stroke="#E8502A" strokeWidth="1.5"/>
        <path d="M10 3C10 3 13 6.5 13 10C13 13.5 10 17 10 17" stroke="#E8502A" strokeWidth="1.5"/>
        <path d="M3 10H17" stroke="#E8502A" strokeWidth="1.5"/>
      </svg>
    ),
    title: "Global Edge Network",
    desc: "Nodes across US, EU, Asia, and LATAM — always route through the fastest point of presence.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="5" width="16" height="10" rx="2" stroke="#E8502A" strokeWidth="1.5"/>
        <path d="M6 9L8 11L12 7" stroke="#E8502A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14 9H16" stroke="#E8502A" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: "License Key System",
    desc: "Hardware-bound or floating licenses. Activate, deactivate, and transfer at any time.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M3 10H5M15 10H17M10 3V5M10 15V17" stroke="#E8502A" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="10" cy="10" r="4" stroke="#E8502A" strokeWidth="1.5"/>
        <circle cx="10" cy="10" r="1.5" fill="#E8502A"/>
      </svg>
    ),
    title: "Instant Delivery",
    desc: "License keys delivered immediately after payment. Zero waiting, zero manual intervention.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M2 14L10 6L13 9L18 4" stroke="#E8502A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14 4H18V8" stroke="#E8502A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 18H18" stroke="#E8502A" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: "99.9% Uptime SLA",
    desc: "Real monitoring, real incidents page, real compensation. We back our uptime with credits.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M5 10H15M5 6H15M5 14H11" stroke="#E8502A" strokeWidth="1.5" strokeLinecap="round"/>
        <rect x="2" y="2" width="16" height="16" rx="3" stroke="#E8502A" strokeWidth="1.5"/>
      </svg>
    ),
    title: "Verify API",
    desc: "Public REST endpoint for license verification — build it into your own stack in minutes.",
  },
];

const PROXY_TYPES = [
  {
    id: "ultraviolet",
    name: "Ultraviolet",
    arch: "Service Worker",
    color: "#6366f1",
    desc: "Client-side TLS via service worker. The cleanest architecture for browser-based proxying.",
    tags: ["Streaming", "WebSocket", "TLS"],
  },
  {
    id: "rammerhead",
    name: "Rammerhead",
    arch: "Rewriting Proxy",
    color: "#E8502A",
    desc: "URL-obfuscated, session-isolated rewriting proxy. Near-impossible for filters to identify.",
    tags: ["High-stealth", "Cookie mgmt", "Obfuscation"],
  },
  {
    id: "meteor",
    name: "Meteor",
    arch: "Edge WebSocket",
    color: "#F5A623",
    desc: "Sub-50ms latency via WebSocket-first edge routing. Built for real-time applications.",
    tags: ["Real-time", "Video", "Low latency"],
  },
  {
    id: "wisp",
    name: "WISP",
    arch: "Protocol Tunnel",
    color: "#A855F7",
    desc: "Raw TCP/UDP tunneling through WebSocket. Any port, any protocol, zero client install.",
    tags: ["TCP/UDP", "Any port", "Protocol-level"],
  },
  {
    id: "dynamic",
    name: "Dynamic",
    arch: "Bare-Metal Rotating",
    color: "#2DD4A0",
    desc: "Bare-metal with rotating IP pool. Designed for high-throughput automated workloads.",
    tags: ["IP rotation", "API auth", "10Gbps"],
  },
];

const TESTIMONIALS = [
  {
    quote: "Switched from a sketchy shared proxy service. ProxyMarket's Rammerhead plan has been flawless — none of the filter detection issues we had before.",
    author: "Marcus R.",
    role: "IT Admin",
    avatar: "MR",
  },
  {
    quote: "The license verify API made integration trivially easy. Had it running in our deployment in under 20 minutes.",
    author: "Priya S.",
    role: "Backend Developer",
    avatar: "PS",
  },
  {
    quote: "Ultraviolet is the only proxy I've found that handles live video streaming without buffering. Worth every cent.",
    author: "Dex T.",
    role: "Power User",
    avatar: "DT",
  },
];

const TICKER_ITEMS = [
  "Ultraviolet", "Rammerhead", "Meteor", "WISP", "Dynamic",
  "Service Worker", "Protocol Tunnel", "Edge Network", "TLS Encryption",
  "WebSocket", "IP Rotation", "License Keys", "Instant Delivery",
];

export default async function HomePage() {
  const user = await getSession();
  const featuredProducts = await db.product.findMany({
    where: { isActive: true, isFeatured: true },
    orderBy: { sortOrder: "asc" },
    take: 3,
  });

  return (
    <div className="min-h-screen bg-void overflow-x-hidden">
      <Navbar user={user} />

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative min-h-[100dvh] flex flex-col items-center justify-center pt-16 pb-24 px-4">
        {/* Background layers */}
        <div className="absolute inset-0 bg-grid opacity-40 pointer-events-none" />
        <div className="absolute inset-0 bg-ember-glow pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-ember/5 blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-ember/20 mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-jade animate-pulse" />
            <span className="text-xs font-medium text-dust tracking-wide">
              5 proxy architectures. One marketplace.
            </span>
          </div>

          <h1 className="font-display font-800 text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[1.02] tracking-tight mb-6 animate-fade-up stagger-1">
            <span className="text-chalk">The proxy</span>
            <br />
            <span className="text-gradient-ember">infrastructure</span>
            <br />
            <span className="text-chalk">you deserve.</span>
          </h1>

          <p className="text-dust text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-10 animate-fade-up stagger-2">
            Professional web proxy services built for reliability.
            Choose from five distinct architectures — from service worker TLS
            to bare-metal IP rotation — with instant license delivery.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-up stagger-3">
            <Link href="/products" className="btn btn-ember px-6 py-3 text-base">
              Browse plans
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <Link href="#proxies" className="btn btn-ghost px-6 py-3 text-base">
              Compare architectures
            </Link>
          </div>

          {/* Social proof numbers */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 sm:gap-12 animate-fade-up stagger-4">
            {[
              { value: "12K+", label: "Active licenses" },
              { value: "99.9%", label: "Uptime SLA" },
              { value: "5", label: "Proxy architectures" },
              { value: "<2min", label: "Avg delivery time" },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="font-display font-700 text-2xl text-chalk">{value}</div>
                <div className="text-xs text-ghost mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-float">
          <span className="text-xs text-ghost">Scroll</span>
          <svg width="14" height="20" viewBox="0 0 14 20" fill="none">
            <rect x="1" y="1" width="12" height="18" rx="6" stroke="#5C5A6E" strokeWidth="1.5"/>
            <rect x="6" y="4" width="2" height="4" rx="1" fill="#5C5A6E">
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0 0; 0 4; 0 0"
                dur="2s"
                repeatCount="indefinite"
              />
            </rect>
          </svg>
        </div>
      </section>

      {/* ── Ticker ─────────────────────────────────────────────────── */}
      <div className="border-y border-line/50 py-4 ticker-wrap">
        <div className="ticker-inner">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="flex items-center gap-3 text-sm font-medium text-ghost whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-ember/50" />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── Proxy Type Showcase ──────────────────────────────────────── */}
      <section id="proxies" className="py-24 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs font-600 text-ember uppercase tracking-widest mb-3">Architectures</p>
          <h2 className="font-display font-700 text-3xl sm:text-4xl md:text-5xl text-chalk tracking-tight">
            Not all proxies are equal.
          </h2>
          <p className="text-dust text-lg mt-4 max-w-xl mx-auto">
            Each architecture solves a different problem. Pick the one that fits your workflow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PROXY_TYPES.map((proxy, i) => (
            <div
              key={proxy.id}
              className="product-card p-6 group cursor-pointer"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              {/* Color indicator */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-5"
                style={{ background: `${proxy.color}18`, border: `1px solid ${proxy.color}30` }}
              >
                <div className="w-4 h-4 rounded-full" style={{ background: proxy.color }} />
              </div>

              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="font-display font-700 text-lg text-chalk">{proxy.name}</h3>
                  <span className="text-xs text-ghost font-mono">{proxy.arch}</span>
                </div>
              </div>

              <p className="text-dust text-sm leading-relaxed mb-5">{proxy.desc}</p>

              <div className="flex flex-wrap gap-2">
                {proxy.tags.map((tag) => (
                  <span key={tag} className="px-2.5 py-1 rounded-lg bg-muted text-ghost text-xs font-medium">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-5 pt-5 border-t border-line">
                <Link
                  href={`/products?type=${proxy.id}`}
                  className="text-sm font-medium text-dust hover:text-chalk flex items-center gap-1.5 group-hover:gap-2.5 transition-all"
                >
                  View plans
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
              </div>
            </div>
          ))}

          {/* CTA card */}
          <div className="product-card featured p-6 flex flex-col justify-between lg:col-span-1 md:col-span-2">
            <div>
              <span className="badge badge-ember mb-5 inline-flex">Most Popular</span>
              <h3 className="font-display font-700 text-xl text-chalk mb-2">
                Not sure which to pick?
              </h3>
              <p className="text-dust text-sm leading-relaxed">
                Our guide walks through each architecture with real-world use cases, performance benchmarks, and a compatibility matrix.
              </p>
            </div>
            <Link
              href="/docs/choosing"
              className="btn btn-ember mt-6 w-fit text-sm"
            >
              Read the guide →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features Grid ─────────────────────────────────────────── */}
      <section className="py-24 px-4 bg-ink border-y border-line/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-600 text-ember uppercase tracking-widest mb-3">Platform</p>
            <h2 className="font-display font-700 text-3xl sm:text-4xl text-chalk tracking-tight">
              Built for reliability at every layer.
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {PROXY_FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="group p-6 rounded-2xl bg-surface border border-line hover:border-ember/20 transition-all duration-300 hover:shadow-card-hover"
              >
                <div className="w-10 h-10 rounded-xl bg-ember/10 flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="font-display font-600 text-base text-chalk mb-2">{f.title}</h3>
                <p className="text-dust text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ──────────────────────────────────────── */}
      {featuredProducts.length > 0 && (
        <section className="py-24 px-4 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
            <div>
              <p className="text-xs font-600 text-ember uppercase tracking-widest mb-2">Popular Plans</p>
              <h2 className="font-display font-700 text-3xl text-chalk tracking-tight">
                Start here.
              </h2>
            </div>
            <Link href="/products" className="text-sm font-medium text-dust hover:text-chalk flex items-center gap-1.5 transition-colors">
              All plans →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {featuredProducts.map((product) => (
              <div key={product.id} className="product-card featured p-6 flex flex-col">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <span className="badge badge-ember mb-2 block w-fit">
                      {product.billingPeriod === "LIFETIME" ? "Lifetime" :
                       product.billingPeriod === "YEARLY" ? "Yearly" : "Monthly"}
                    </span>
                    <h3 className="font-display font-700 text-lg text-chalk">{product.name}</h3>
                  </div>
                </div>

                <p className="text-dust text-sm leading-relaxed mb-6 flex-1">{product.description}</p>

                <div className="border-t border-line pt-5">
                  <div className="flex items-baseline gap-1.5 mb-5">
                    <span className="font-display font-800 text-3xl text-chalk">
                      {formatCurrency(product.price)}
                    </span>
                    <span className="text-sm text-ghost">
                      {product.billingPeriod === "LIFETIME" ? "one-time" :
                       product.billingPeriod === "YEARLY" ? "/ yr" : "/ mo"}
                    </span>
                  </div>
                  <Link
                    href={`/checkout?product=${product.slug}`}
                    className="btn btn-ember w-full text-sm py-2.5"
                  >
                    Get started
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Testimonials ──────────────────────────────────────────── */}
      <section className="py-24 px-4 bg-ink border-y border-line/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-600 text-ember uppercase tracking-widest mb-3">Testimonials</p>
            <h2 className="font-display font-700 text-3xl sm:text-4xl text-chalk tracking-tight">
              Used by people who care about reliability.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t) => (
              <div key={t.author} className="p-6 rounded-2xl bg-surface border border-line">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} width="14" height="14" viewBox="0 0 14 14" fill="#E8502A">
                      <path d="M7 1l1.5 4.5H13l-3.8 2.8 1.4 4.4L7 10 3.4 12.7l1.4-4.4L1 5.5h4.5z"/>
                    </svg>
                  ))}
                </div>
                <p className="text-dust text-sm leading-relaxed mb-5 italic">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-ember/20 flex items-center justify-center text-ember text-xs font-bold font-display">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-600 text-chalk">{t.author}</div>
                    <div className="text-xs text-ghost">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────────── */}
      <section className="py-24 px-4 max-w-7xl mx-auto">
        <div className="relative rounded-3xl bg-surface border border-ember/25 p-12 sm:p-16 overflow-hidden text-center">
          <div className="absolute inset-0 bg-ember-glow pointer-events-none opacity-60" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-ember/8 blur-[80px] pointer-events-none" />
          <div className="relative z-10">
            <h2 className="font-display font-800 text-4xl sm:text-5xl text-chalk tracking-tight mb-4">
              Ready to get started?
            </h2>
            <p className="text-dust text-lg max-w-lg mx-auto mb-8">
              Pick a plan, pay once, get your key instantly. No waiting, no support tickets to open.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/products" className="btn btn-ember px-8 py-3.5 text-base">
                Browse all plans
              </Link>
              <Link href="/register" className="btn btn-ghost px-8 py-3.5 text-base">
                Create account
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
