// src/app/checkout/success/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { formatCurrency, formatDate } from "@/lib/utils";

export const metadata = { title: "Order Confirmed" };

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: { order?: string };
}) {
  const user = await getSession();
  if (!user) redirect("/login");

  if (!searchParams.order) redirect("/dashboard");

  const order = await db.order.findUnique({
    where: { id: searchParams.order, userId: user.id },
    include: {
      product: true,
      license: true,
    },
  });

  if (!order) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-void flex items-center justify-center px-4">
      <div className="max-w-lg w-full">
        {/* Success animation */}
        <div className="text-center mb-8">
          <div className="relative inline-flex">
            <div className="w-20 h-20 rounded-full bg-jade/10 border border-jade/30 flex items-center justify-center mx-auto mb-6">
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <path
                  d="M9 18L15 24L27 12"
                  stroke="#2DD4A0"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="animate-[dash_0.5s_ease_0.2s_both]"
                  style={{
                    strokeDasharray: 30,
                    strokeDashoffset: 0,
                  }}
                />
              </svg>
            </div>
          </div>
          <h1 className="font-display font-800 text-3xl text-chalk mb-2">
            Order confirmed
          </h1>
          <p className="text-dust text-sm">
            Your license key has been generated and is ready to use.
          </p>
        </div>

        {/* Order card */}
        <div className="rounded-2xl bg-surface border border-line overflow-hidden mb-5">
          <div className="px-6 py-4 border-b border-line flex items-center justify-between">
            <span className="text-sm font-600 text-chalk">Order #{order.id.slice(-8).toUpperCase()}</span>
            <span className="badge badge-jade">Completed</span>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-ghost">Product</span>
              <span className="text-chalk font-medium">{order.product.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-ghost">Amount</span>
              <span className="text-chalk">{formatCurrency(order.amountTotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-ghost">Date</span>
              <span className="text-chalk">{formatDate(order.createdAt)}</span>
            </div>
          </div>

          {order.license && (
            <div className="px-6 py-5 bg-overlay border-t border-line">
              <div className="text-xs font-600 text-ghost uppercase tracking-wider mb-3">
                Your license key
              </div>
              <div className="flex items-center gap-3">
                <code className="flex-1 font-mono text-sm text-jade bg-jade/5 border border-jade/20 rounded-xl px-4 py-3 tracking-wider">
                  {order.license.key}
                </code>
              </div>
              <p className="text-xs text-ghost mt-2">
                Store this key securely. Use it to activate your proxy service.
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Link href="/dashboard" className="btn btn-ember flex-1 py-3 text-sm">
            Go to dashboard
          </Link>
          <Link href="/products" className="btn btn-ghost flex-1 py-3 text-sm">
            Browse more
          </Link>
        </div>
      </div>
    </div>
  );
}
