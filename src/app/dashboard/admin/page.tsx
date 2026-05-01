// src/app/dashboard/admin/page.tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils";

export const metadata = { title: "Admin" };

export default async function AdminPage() {
  const user = await getSession();
  if (!user || user.role !== "ADMIN") redirect("/dashboard");

  const [userCount, orderCount, licenseCount, recentOrders, recentLicenses, revenue] =
    await Promise.all([
      db.user.count(),
      db.order.count({ where: { status: "COMPLETED" } }),
      db.license.count({ where: { status: "ACTIVE" } }),
      db.order.findMany({
        where: { status: "COMPLETED" },
        include: { user: { select: { email: true, username: true } }, product: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      db.license.findMany({
        include: { user: { select: { email: true, username: true } }, product: true },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      db.order.aggregate({
        where: { status: "COMPLETED" },
        _sum: { amountTotal: true },
      }),
    ]);

  const totalRevenue = revenue._sum.amountTotal ?? 0;

  return (
    <div className="min-h-screen bg-void">
      <Navbar user={user} />
      <div className="pt-28 pb-24 px-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge badge-ember">Admin</span>
            </div>
            <h1 className="font-display font-700 text-3xl text-chalk">Overview</h1>
          </div>
          <Link href="/dashboard/admin/products" className="btn btn-ghost text-sm px-4 py-2">
            Manage products
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Total Revenue", value: formatCurrency(totalRevenue), color: "#E8502A" },
            { label: "Completed Orders", value: orderCount.toString(), color: "#2DD4A0" },
            { label: "Active Licenses", value: licenseCount.toString(), color: "#F5A623" },
            { label: "Total Users", value: userCount.toString(), color: "#A855F7" },
          ].map(({ label, value, color }) => (
            <div key={label} className="p-5 rounded-2xl bg-surface border border-line">
              <div className="font-display font-800 text-2xl text-chalk mb-1">{value}</div>
              <div className="text-sm text-dust">{label}</div>
              <div className="mt-3 h-0.5 rounded-full" style={{ background: `${color}50` }}>
                <div className="h-full w-3/4 rounded-full" style={{ background: color }} />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent orders */}
          <div className="rounded-2xl bg-surface border border-line overflow-hidden">
            <div className="px-5 py-4 border-b border-line flex items-center justify-between">
              <h2 className="font-display font-600 text-base text-chalk">Recent Orders</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-line/60">
                    <th className="text-left px-5 py-3 text-xs font-600 text-ghost uppercase tracking-wider">User</th>
                    <th className="text-left px-5 py-3 text-xs font-600 text-ghost uppercase tracking-wider">Product</th>
                    <th className="text-left px-5 py-3 text-xs font-600 text-ghost uppercase tracking-wider">Amount</th>
                    <th className="text-left px-5 py-3 text-xs font-600 text-ghost uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/50">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-overlay/40 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="text-sm text-chalk font-medium">{order.user.username}</div>
                        <div className="text-xs text-ghost">{order.user.email}</div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-dust">{order.product.name}</td>
                      <td className="px-5 py-3.5 text-sm font-600 text-jade">{formatCurrency(order.amountTotal)}</td>
                      <td className="px-5 py-3.5 text-xs text-ghost">{formatDate(order.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent licenses */}
          <div className="rounded-2xl bg-surface border border-line overflow-hidden">
            <div className="px-5 py-4 border-b border-line flex items-center justify-between">
              <h2 className="font-display font-600 text-base text-chalk">Recent Licenses</h2>
            </div>
            <div className="divide-y divide-line/50">
              {recentLicenses.map((lic) => (
                <div key={lic.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-overlay/40 transition-colors">
                  <div>
                    <div className="text-sm text-chalk font-medium">{lic.user.username}</div>
                    <code className="text-xs font-mono text-ghost">{lic.key.slice(0, 18)}…</code>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-dust">{lic.product.name}</div>
                    <span className={`badge ${lic.status === "ACTIVE" ? "badge-jade" : "badge-amber"} mt-1`}>
                      {lic.status.toLowerCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
