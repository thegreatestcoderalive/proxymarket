// src/app/products/page.tsx
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { formatCurrency, formatBillingPeriod } from "@/lib/utils";
import { PROXY_TYPE_META } from "@/types";

interface SearchParams {
  type?: string;
  billing?: string;
}

export const metadata = {
  title: "Products",
  description: "Browse all ProxyMarket proxy plans.",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await getSession();

  const whereClause: Record<string, unknown> = { isActive: true };
  if (searchParams.type) {
    const type = searchParams.type.toUpperCase();
    if (Object.keys(PROXY_TYPE_META).includes(type)) {
      whereClause.proxyType = type;
    }
  }
  if (searchParams.billing) {
    whereClause.billingPeriod = searchParams.billing.toUpperCase();
  }

  const products = await db.product.findMany({
    where: whereClause,
    orderBy: [{ sortOrder: "asc" }, { price: "asc" }],
  });

  const proxyTypes = await db.product.groupBy({
    by: ["proxyType"],
    where: { isActive: true },
  });

  return (
    <div className="min-h-screen bg-void">
      <Navbar user={user} />

      <div className="pt-32 pb-24 px-4 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-xs font-600 text-ember uppercase tracking-widest mb-3">Store</p>
          <h1 className="font-display font-800 text-4xl sm:text-5xl text-chalk tracking-tight mb-4">
            Choose your proxy.
          </h1>
          <p className="text-dust text-lg max-w-xl mx-auto">
            All plans include instant license delivery, access to our dashboard, and the Verify API.
          </p>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {/* Type filter */}
          <div className="flex flex-wrap gap-2">
            <Link
              href="/products"
              className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                !searchParams.type
                  ? "bg-ember text-white"
                  : "bg-surface border border-line text-dust hover:text-chalk hover:border-ghost/50"
              }`}
            >
              All types
            </Link>
            {proxyTypes.map(({ proxyType }) => {
              const meta = PROXY_TYPE_META[proxyType];
              if (!meta) return null;
              const isActive = searchParams.type?.toUpperCase() === proxyType;
              return (
                <Link
                  key={proxyType}
                  href={`/products?type=${proxyType.toLowerCase()}${searchParams.billing ? `&billing=${searchParams.billing}` : ""}`}
                  className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all border ${
                    isActive
                      ? "bg-ember/15 border-ember/40 text-ember-300"
                      : "bg-surface border-line text-dust hover:text-chalk hover:border-ghost/50"
                  }`}
                >
                  {meta.label}
                </Link>
              );
            })}
          </div>

          <div className="w-px h-6 bg-line mx-2 hidden sm:block" />

          {/* Billing filter */}
          <div className="flex gap-2">
            {["MONTHLY", "YEARLY", "LIFETIME"].map((period) => {
              const isActive = searchParams.billing?.toUpperCase() === period;
              const labels: Record<string, string> = {
                MONTHLY: "Monthly",
                YEARLY: "Yearly",
                LIFETIME: "Lifetime",
              };
              return (
                <Link
                  key={period}
                  href={`/products?${searchParams.type ? `type=${searchParams.type}&` : ""}billing=${period.toLowerCase()}`}
                  className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all border ${
                    isActive
                      ? "bg-surface border-ghost/50 text-chalk"
                      : "bg-surface border-line text-ghost hover:text-dust"
                  }`}
                >
                  {labels[period]}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Product grid */}
        {products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-dust text-lg mb-4">No plans match your filters.</p>
            <Link href="/products" className="btn btn-ghost text-sm">Clear filters</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map((product, i) => {
              const meta = PROXY_TYPE_META[product.proxyType];
              const isLifetime = product.billingPeriod === "LIFETIME";

              return (
                <div
                  key={product.id}
                  className={`product-card flex flex-col ${product.isFeatured ? "featured" : ""}`}
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  {product.isFeatured && (
                    <div className="px-6 pt-5 pb-0">
                      <span className="badge badge-ember">Most Popular</span>
                    </div>
                  )}

                  <div className="p-6 flex flex-col flex-1">
                    {/* Type badge */}
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className="px-2.5 py-1 rounded-lg text-xs font-600"
                        style={{
                          background: `${meta?.color ?? "#888"}18`,
                          color: meta?.color ?? "#888",
                          border: `1px solid ${meta?.color ?? "#888"}30`,
                        }}
                      >
                        {meta?.label ?? product.proxyType}
                      </div>
                      <span className="text-xs text-ghost font-mono">
                        {meta?.architecture}
                      </span>
                    </div>

                    <h2 className="font-display font-700 text-lg text-chalk mb-2">
                      {product.name}
                    </h2>
                    <p className="text-dust text-sm leading-relaxed mb-5 flex-1">
                      {product.description}
                    </p>

                    {/* Specs */}
                    <div className="grid grid-cols-3 gap-3 mb-5 p-4 rounded-xl bg-overlay border border-muted">
                      {product.bandwidth && (
                        <div className="text-center">
                          <div className="text-xs text-ghost mb-0.5">Bandwidth</div>
                          <div className="text-sm font-600 text-chalk">{product.bandwidth}</div>
                        </div>
                      )}
                      {product.connections && (
                        <div className="text-center">
                          <div className="text-xs text-ghost mb-0.5">Connections</div>
                          <div className="text-sm font-600 text-chalk">{product.connections}x</div>
                        </div>
                      )}
                      {product.speed && (
                        <div className="text-center">
                          <div className="text-xs text-ghost mb-0.5">Speed</div>
                          <div className="text-sm font-600 text-chalk">{product.speed}</div>
                        </div>
                      )}
                    </div>

                    {/* Features */}
                    <ul className="space-y-2 mb-6">
                      {product.features.slice(0, 4).map((feature) => (
                        <li key={feature} className="flex items-center gap-2.5 text-sm text-dust">
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
                            <circle cx="7" cy="7" r="6" fill="rgba(45,212,160,0.1)" stroke="rgba(45,212,160,0.4)" strokeWidth="1"/>
                            <path d="M4.5 7L6 8.5L9.5 5" stroke="#2DD4A0" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          {feature}
                        </li>
                      ))}
                      {product.features.length > 4 && (
                        <li className="text-xs text-ghost pl-6">
                          +{product.features.length - 4} more
                        </li>
                      )}
                    </ul>

                    {/* Regions */}
                    {product.regions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-6">
                        {product.regions.map((r) => (
                          <span key={r} className="px-2 py-0.5 rounded-md bg-muted text-ghost text-xs">
                            {r}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Price + CTA */}
                    <div className="border-t border-line pt-5 mt-auto">
                      <div className="flex items-baseline gap-1.5 mb-4">
                        <span className="font-display font-800 text-3xl text-chalk">
                          {formatCurrency(product.price)}
                        </span>
                        <span className="text-sm text-ghost">
                          {formatBillingPeriod(product.billingPeriod)}
                        </span>
                        {product.billingPeriod === "YEARLY" && (
                          <span className="badge badge-jade ml-2">Save 35%</span>
                        )}
                      </div>
                      <Link
                        href={`/checkout?product=${product.slug}`}
                        className={`btn w-full py-2.5 text-sm ${product.isFeatured ? "btn-ember" : "btn-ghost"}`}
                      >
                        {isLifetime ? "Buy lifetime access" : "Get started"}
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Guarantee section */}
        <div className="mt-16 p-8 rounded-2xl bg-surface border border-line text-center">
          <svg className="mx-auto mb-4" width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path d="M20 4L34 12V20C34 28.837 27.837 37 20 37C12.163 37 6 28.837 6 20V12L20 4Z" stroke="#2DD4A0" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M14 20L18 24L26 16" stroke="#2DD4A0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h3 className="font-display font-700 text-xl text-chalk mb-2">48-hour guarantee</h3>
          <p className="text-dust text-sm max-w-lg mx-auto">
            Not satisfied within 48 hours of purchase? Open a support ticket and we'll refund you — no questions asked. Applies to all plans.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
