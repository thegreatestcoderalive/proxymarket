"use client";
// src/app/checkout/page.tsx
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { formatCurrency, formatBillingPeriod } from "@/lib/utils";
import { PROXY_TYPE_META } from "@/types";

interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  proxyType: string;
  billingPeriod: string;
  price: number;
  features: string[];
  bandwidth: string | null;
  connections: number | null;
  speed: string | null;
  regions: string[];
  isFeatured: boolean;
}

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = searchParams.get("product");

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    if (!slug) { router.push("/products"); return; }
    fetch(`/api/products?slug=${slug}`)
      .then((r) => r.json())
      .then((d) => {
        const found = d.data?.find((p: Product) => p.slug === slug);
        if (!found) router.push("/products");
        else setProduct(found);
      })
      .catch(() => router.push("/products"))
      .finally(() => setLoading(false));
  }, [slug, router]);

  async function handleBuy() {
    if (!product) return;
    setPurchasing(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productSlug: product.slug }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) { router.push(`/login?redirect=/checkout?product=${slug}`); return; }
        toast.error(data.error ?? "Failed to create order");
        return;
      }
      if (data.data?.url) window.location.href = data.data.url;
    } catch {
      toast.error("Network error — try again");
    } finally {
      setPurchasing(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-ember border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!product) return null;

  const meta = PROXY_TYPE_META[product.proxyType];

  return (
    <div className="min-h-screen bg-void">
      {/* Top bar */}
      <div className="border-b border-line/60 bg-ink/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-ember flex items-center justify-center">
              <svg width="15" height="15" viewBox="0 0 18 18" fill="none">
                <path d="M9 2L14.5 6.5V11.5L9 16L3.5 11.5V6.5L9 2Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
                <circle cx="9" cy="9" r="2.5" fill="white"/>
              </svg>
            </div>
            <span className="font-display font-700 text-sm text-chalk">Proxy<span className="text-ember">Market</span></span>
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-ghost">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <rect x="1" y="5" width="10" height="7" rx="1.5" stroke="#5C5A6E" strokeWidth="1.2"/>
              <path d="M3.5 5V3.5a2.5 2.5 0 0 1 5 0V5" stroke="#5C5A6E" strokeWidth="1.2"/>
            </svg>
            Secured by Stripe
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Order summary */}
          <div className="md:col-span-3 order-2 md:order-1">
            <h1 className="font-display font-700 text-2xl text-chalk mb-6">Order summary</h1>

            <div className="rounded-2xl bg-surface border border-line overflow-hidden">
              <div className="p-6 border-b border-line">
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `${meta?.color ?? "#888"}18`, border: `1px solid ${meta?.color ?? "#888"}30` }}
                  >
                    <div className="w-5 h-5 rounded-full" style={{ background: meta?.color ?? "#888" }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="font-display font-700 text-lg text-chalk">{product.name}</h2>
                        <p className="text-sm text-dust mt-0.5">{product.description}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-display font-700 text-xl text-chalk">{formatCurrency(product.price)}</div>
                        <div className="text-xs text-ghost">{formatBillingPeriod(product.billingPeriod)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Specs */}
              <div className="p-6 border-b border-line grid grid-cols-3 gap-4">
                {product.bandwidth && (
                  <div>
                    <div className="text-xs text-ghost mb-1">Bandwidth</div>
                    <div className="text-sm font-600 text-chalk">{product.bandwidth}</div>
                  </div>
                )}
                {product.connections && (
                  <div>
                    <div className="text-xs text-ghost mb-1">Connections</div>
                    <div className="text-sm font-600 text-chalk">{product.connections}x</div>
                  </div>
                )}
                {product.speed && (
                  <div>
                    <div className="text-xs text-ghost mb-1">Speed</div>
                    <div className="text-sm font-600 text-chalk">{product.speed}</div>
                  </div>
                )}
              </div>

              {/* Features */}
              <div className="p-6">
                <h3 className="text-xs font-600 text-ghost uppercase tracking-wider mb-4">What's included</h3>
                <ul className="space-y-3">
                  {product.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-dust">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
                        <circle cx="7" cy="7" r="6" fill="rgba(45,212,160,0.1)" stroke="rgba(45,212,160,0.3)" strokeWidth="1"/>
                        <path d="M4.5 7L6 8.5L9.5 5" stroke="#2DD4A0" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Trust signals */}
            <div className="mt-5 grid grid-cols-3 gap-3">
              {[
                { icon: "🔒", text: "Encrypted payment" },
                { icon: "⚡", text: "Instant delivery" },
                { icon: "↩️", text: "48h guarantee" },
              ].map(({ icon, text }) => (
                <div key={text} className="p-3 rounded-xl bg-surface border border-line text-center">
                  <div className="text-lg mb-1">{icon}</div>
                  <div className="text-xs text-ghost">{text}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment panel */}
          <div className="md:col-span-2 order-1 md:order-2">
            <div className="sticky top-8">
              <div className="rounded-2xl bg-surface border border-line p-6">
                <h2 className="font-display font-700 text-lg text-chalk mb-5">Complete purchase</h2>

                <div className="space-y-3 mb-5 pb-5 border-b border-line">
                  <div className="flex justify-between text-sm">
                    <span className="text-dust">{product.name}</span>
                    <span className="text-chalk font-medium">{formatCurrency(product.price)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-dust">Tax</span>
                    <span className="text-chalk">Calculated at checkout</span>
                  </div>
                </div>

                <div className="flex justify-between text-base font-700 mb-6">
                  <span className="text-chalk">Total today</span>
                  <span className="text-chalk">{formatCurrency(product.price)}</span>
                </div>

                <button
                  onClick={handleBuy}
                  disabled={purchasing}
                  className="btn btn-ember w-full py-3.5 text-sm font-600"
                >
                  {purchasing ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10"/>
                      </svg>
                      Redirecting to Stripe…
                    </span>
                  ) : (
                    <>
                      Pay {formatCurrency(product.price)}
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-ghost mt-4">
                  Powered by Stripe. We never store card details.
                </p>

                <div className="mt-4 flex items-center justify-center gap-3 opacity-50">
                  {["visa", "mastercard", "amex", "discover"].map((card) => (
                    <div key={card} className="px-2 py-1 rounded bg-muted text-2xs text-ghost font-mono uppercase">
                      {card}
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-center text-xs text-ghost mt-4">
                By purchasing you agree to our{" "}
                <Link href="/terms" className="text-dust hover:text-chalk transition-colors">Terms</Link>
                {" "}and{" "}
                <Link href="/refunds" className="text-dust hover:text-chalk transition-colors">Refund Policy</Link>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
