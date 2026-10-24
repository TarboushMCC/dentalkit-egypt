"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Users, Package, TrendingUp, ArrowUpRight, ArrowDownRight, Clock } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { staggerContainer, staggerItem } from "@/lib/motion";

interface KPIs {
  totalRevenue: number;
  monthRevenue: number;
  revenueChange: number;
  totalOrders: number;
  monthOrders: number;
  ordersChange: number;
  totalStudents: number;
  monthStudents: number;
  pendingOrders: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  user: { name: string | null; email: string };
  items: { id: string }[];
}

interface TopUniversity {
  id: string;
  name: string;
  _count: { packages: number; studentProfiles: number };
}

const statusStyle: Record<string, string> = {
  DELIVERED: "bg-green-50 text-green-700 border-green-100",
  SHIPPED: "bg-blue-50 text-blue-700 border-blue-100",
  PROCESSING: "bg-amber-50 text-amber-700 border-amber-100",
  PENDING: "bg-gray-50 text-gray-600 border-gray-100",
  CONFIRMED: "bg-indigo-50 text-indigo-700 border-indigo-100",
  CANCELLED: "bg-red-50 text-red-600 border-red-100",
};

function ChangeChip({ value }: { value: number }) {
  const up = value >= 0;
  return (
    <span className={`flex items-center gap-0.5 text-xs font-semibold ${up ? "text-green-600" : "text-red-500"}`}>
      {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
      {Math.abs(value)}%
    </span>
  );
}

export default function AdminPage() {
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [universities, setUniversities] = useState<TopUniversity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setKpis(json.data.kpis);
          setRecentOrders(json.data.recentOrders ?? []);
          setUniversities(json.data.topUniversities ?? []);
        } else {
          setError(json.error ?? "Failed to load stats");
        }
      })
      .catch(() => setError("Network error"))
      .finally(() => setLoading(false));
  }, []);

  const maxOrders = Math.max(...universities.map((u) => u._count.studentProfiles), 1);

  const kpiCards = kpis
    ? [
        { label: "Total Revenue", value: formatPrice(kpis.totalRevenue), change: kpis.revenueChange, icon: TrendingUp, bg: "#E8F0F8", color: "#0A2540" },
        { label: "Total Orders", value: String(kpis.totalOrders), change: kpis.ordersChange, icon: ShoppingBag, bg: "#E0F7FC", color: "#00B4D8" },
        { label: "Active Students", value: kpis.totalStudents.toLocaleString(), change: null, icon: Users, bg: "#EDE7F6", color: "#673AB7" },
        { label: "Pending Orders", value: String(kpis.pendingOrders), change: null, icon: Clock, bg: "#FFF3E0", color: "#FF9800" },
      ]
    : [];

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="font-display text-2xl font-bold text-[#0A2540]">Dashboard Overview</h1>
        <p className="text-sm text-[#6B7A8D] mt-1">Welcome back. Here's what's happening on DentalKit today.</p>
      </motion.div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      {/* KPIs */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#E2E8F0] p-5 h-28 animate-pulse" />
          ))}
        </div>
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiCards.map((k) => (
            <motion.div key={k.label} variants={staggerItem}>
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: k.bg }}>
                    <k.icon size={18} style={{ color: k.color }} />
                  </div>
                  {k.change !== null && <ChangeChip value={k.change} />}
                </div>
                <p className="font-display text-2xl font-bold text-[#0A2540]">{k.value}</p>
                <p className="text-xs text-[#9BAAB8] mt-0.5">{k.label}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0]">
              <h2 className="font-display font-semibold text-[#0A2540]">Recent Orders</h2>
              <a href="/admin/orders" className="text-xs text-[#00B4D8] hover:text-[#0A2540] font-medium cursor-pointer">View all</a>
            </div>
            {loading ? (
              <div className="px-5 py-8 text-center text-sm text-[#9BAAB8] animate-pulse">Loading…</div>
            ) : recentOrders.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-[#9BAAB8]">No orders yet</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs font-semibold text-[#9BAAB8] uppercase tracking-wide border-b border-[#F4F6F8]">
                      <th className="px-5 py-3">Order</th>
                      <th className="px-5 py-3">Student</th>
                      <th className="px-5 py-3">Amount</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F4F6F8]">
                    {recentOrders.map((o) => (
                      <tr key={o.id} className="hover:bg-[#FAFAF8] transition-colors">
                        <td className="px-5 py-3.5">
                          <span className="text-xs font-mono font-semibold text-[#0A2540]">{o.orderNumber}</span>
                          <p className="text-xs text-[#9BAAB8] mt-0.5">{o.items.length} item(s)</p>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-[#1A1A2E]">{o.user.name ?? o.user.email}</td>
                        <td className="px-5 py-3.5 text-sm font-semibold text-[#0A2540]">{formatPrice(o.total)}</td>
                        <td className="px-5 py-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusStyle[o.status] ?? "bg-gray-50 text-gray-600 border-gray-100"}`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-[#9BAAB8]">
                          {new Date(o.createdAt).toLocaleDateString("en-EG", { month: "short", day: "numeric" })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>

        {/* Top Universities */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}>
          <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E2E8F0]">
              <h2 className="font-display font-semibold text-[#0A2540]">Top Universities</h2>
            </div>
            {loading ? (
              <div className="px-5 py-8 text-center text-sm text-[#9BAAB8] animate-pulse">Loading…</div>
            ) : (
              <div className="p-4 space-y-3">
                {universities.map((u, i) => (
                  <div key={u.id} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-[#9BAAB8] w-4">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#0A2540] truncate">{u.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex-1 h-1.5 bg-[#F4F6F8] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#00B4D8] rounded-full"
                            style={{ width: `${(u._count.studentProfiles / maxOrders) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-[#9BAAB8] shrink-0">{u._count.packages} pkgs</span>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-[#0A2540] shrink-0">
                      {u._count.studentProfiles} students
                    </span>
                  </div>
                ))}
                {universities.length === 0 && (
                  <p className="text-sm text-[#9BAAB8] text-center py-4">No university data yet</p>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
