// src/app/dashboard/page.tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils";
import { maskLicenseKey } from "@/lib/license";
import { PROXY_TYPE_META } from "@/types";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await getSession();
  if (!user) redirect("/login");

  const [licenses, orders] = await Promise.all([
    db.license.findMany({
      where: { userId: user.id },
      include: { product: true },
      orderBy: { createdAt: "desc" },
    }),
    db.order.findMany({
      where: { userId: user.id },
      include: { product: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const totalSpend = orders
    .filter((o) => o.status === "COMPLETED")
    .reduce((sum, o) => sum + o.amountTotal, 0);

  const activeLicenses = licenses.filter((l) => l.status === "ACTIVE").length;

  const statusColors: Record<string, string> = {
    ACTIVE: "badge-jade",
    EXPIRED: "badge-amber",
    REVOKED: "badge-ember",
    SUSPENDED: "badge-amber",
  };

  const orderStatusColors: Record<string, string> = {
    COMPLETED: "badge-jade",
    PENDING: "badge-amber",
    FAILED: "badge-ember",
    REFUNDED: "badge-amber",
  };

  return (
    <div className="min-h-screen bg-void">
      <Navbar user={user} />

      <div className="pt-28 pb-24 px-4 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="font-display font-700 text-3xl text-chalk">
              Dashboard
            </h1>
            <p className="text-dust text-sm mt-1">
              Welcome back, <span className="text-chalk font-medium">{user.username}</span>
            </p>
          </div>
          <Link href="/products" className="btn btn-ember text-sm px-4 py-2">
            Browse plans
          </Link>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[
            {
              label: "Active Licenses",
              value: activeLicenses.toString(),
              icon: (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <rect x="1" y="5" width="16" height="10" rx="2" stroke="#2DD4A0" strokeWidth="1.5"/>
                  <path d="M5 9L7 11L11 7" stroke="#2DD4A0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ),
              color: "#2DD4A0",
            },
            {
              label: "Total Orders",
              value: orders.length.toString(),
              icon: (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M2 2H4L5.5 11H13.5L15 5H5.5" stroke="#E8502A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="7" cy="14.5" r="1.5" fill="#E8502A"/>
                  <circle cx="12" cy="14.5" r="1.5" fill="#E8502A"/>
                </svg>
              ),
              color: "#E8502A",
            },
            {
              label: "Total Spent",
              value: formatCurrency(totalSpend),
              icon: (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <rect x="1" y="4" width="16" height="11" rx="2" stroke="#F5A623" strokeWidth="1.5"/>
                  <path d="M1 8H17" stroke="#F5A623" strokeWidth="1.5"/>
                  <circle cx="5" cy="12" r="1" fill="#F5A623"/>
                </svg>
              ),
              color: "#F5A623",
            },
          ].map(({ label, value, icon, color }) => (
            <div key={label} className="p-5 rounded-2xl bg-surface border border-line">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center mb-4"
                style={{ background: `${color}15`, border: `1px solid ${color}25` }}
              >
                {icon}
              </div>
              <div className="font-display font-700 text-2xl text-chalk">{value}</div>
              <div className="text-sm text-dust mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Licenses table */}
        <div className="mb-10">
          <h2 className="font-display font-700 text-xl text-chalk mb-5">Your Licenses</h2>

          {licenses.length === 0 ? (
            <div className="p-10 rounded-2xl bg-surface border border-line text-center">
              <p className="text-dust mb-4">You don&apos;t have any licenses yet.</p>
              <Link href="/products" className="btn btn-ember text-sm">
                Browse plans
              </Link>
            </div>
          ) : (
            <div className="rounded-2xl bg-surface border border-line overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-line">
                      <th className="text-left px-5 py-3.5 text-xs font-600 text-ghost uppercase tracking-wider">Product</th>
                      <th className="text-left px-5 py-3.5 text-xs font-600 text-ghost uppercase tracking-wider">License Key</th>
                      <th className="text-left px-5 py-3.5 text-xs font-600 text-ghost uppercase tracking-wider">Status</th>
                      <th className="text-left px-5 py-3.5 text-xs font-600 text-ghost uppercase tracking-wider">Expires</th>
                      <th className="text-left px-5 py-3.5 text-xs font-600 text-ghost uppercase tracking-wider">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {licenses.map((license) => {
                      const meta = PROXY_TYPE_META[license.product.proxyType];
                      return (
                        <tr key={license.id} className="hover:bg-overlay/50 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                                style={{
                                  background: `${meta?.color ?? "#888"}18`,
                                  border: `1px solid ${meta?.color ?? "#888"}30`,
                                }}
                              >
                                <div className="w-2.5 h-2.5 rounded-full" style={{ background: meta?.color ?? "#888" }} />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-chalk">{license.product.name}</div>
                                <div className="text-xs text-ghost">{meta?.label}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <LicenseKeyCell licenseKey={license.key} />
                          </td>
                          <td className="px-5 py-4">
                            <span className={`badge ${statusColors[license.status] ?? "badge-amber"}`}>
                              {license.status.charAt(0) + license.status.slice(1).toLowerCase()}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-sm text-dust">
                            {license.expiresAt ? formatDate(license.expiresAt) : "Never"}
                          </td>
                          <td className="px-5 py-4 text-sm text-dust">
                            {formatDate(license.createdAt)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Recent orders */}
        <div>
          <h2 className="font-display font-700 text-xl text-chalk mb-5">Order History</h2>

          {orders.length === 0 ? (
            <div className="p-10 rounded-2xl bg-surface border border-line text-center">
              <p className="text-dust">No orders yet.</p>
            </div>
          ) : (
            <div className="rounded-2xl bg-surface border border-line overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-line">
                      <th className="text-left px-5 py-3.5 text-xs font-600 text-ghost uppercase tracking-wider">Product</th>
                      <th className="text-left px-5 py-3.5 text-xs font-600 text-ghost uppercase tracking-wider">Amount</th>
                      <th className="text-left px-5 py-3.5 text-xs font-600 text-ghost uppercase tracking-wider">Status</th>
                      <th className="text-left px-5 py-3.5 text-xs font-600 text-ghost uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-overlay/50 transition-colors">
                        <td className="px-5 py-4 text-sm font-medium text-chalk">
                          {order.product.name}
                        </td>
                        <td className="px-5 py-4 text-sm text-dust">
                          {formatCurrency(order.amountTotal)}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`badge ${orderStatusColors[order.status] ?? "badge-amber"}`}>
                            {order.status.charAt(0) + order.status.slice(1).toLowerCase()}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-dust">
                          {formatDate(order.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Client component for copy-to-clipboard license key
function LicenseKeyCell({ licenseKey }: { licenseKey: string }) {
  return (
    <div className="flex items-center gap-2">
      <code className="text-xs font-mono text-dust bg-overlay px-2 py-1 rounded">
        {maskLicenseKey(licenseKey)}
      </code>
    </div>
  );
}
