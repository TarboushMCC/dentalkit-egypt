"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ShoppingBag, Package, Heart, ArrowRight, CheckCircle2, Clock, Truck } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { staggerContainer, staggerItem } from "@/lib/motion";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  items?: { product?: { name: string }; package?: { name: string } }[];
}

const statusIcon = (s: string) => {
  if (s === "DELIVERED") return <CheckCircle2 size={13} className="text-green-600" />;
  if (s === "SHIPPED") return <Truck size={13} className="text-blue-500" />;
  return <Clock size={13} className="text-amber-500" />;
};

const statusLabel = (s: string) => {
  const map: Record<string, string> = {
    PENDING: "Pending",
    CONFIRMED: "Confirmed",
    PROCESSING: "Processing",
    SHIPPED: "Shipped",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
  };
  return map[s] ?? s;
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const firstName = session?.user?.name?.split(" ")[0] ?? "there";

  useEffect(() => {
    async function fetchData() {
      try {
        const [ordersRes, wishlistRes] = await Promise.all([
          fetch("/api/orders"),
          fetch("/api/wishlist"),
        ]);
        if (ordersRes.ok) {
          const data = await ordersRes.json();
          setOrders(data.orders ?? []);
        }
        if (wishlistRes.ok) {
          const data = await wishlistRes.json();
          setWishlistCount((data.items ?? []).length);
        }
      } catch {
        // silently fall back to empty state
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const totalOrders = orders.length;
  const activeOrders = orders.filter((o) =>
    ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED"].includes(o.status)
  ).length;
  const recentOrders = orders.slice(0, 3);

  const stats = [
    { label: "Total Orders", value: loading ? "—" : String(totalOrders), icon: ShoppingBag, color: "#0A2540", bg: "#E8F0F8" },
    { label: "Active Orders", value: loading ? "—" : String(activeOrders), icon: Clock, color: "#00B4D8", bg: "#E0F7FC" },
    { label: "Wishlist Items", value: loading ? "—" : String(wishlistCount), icon: Heart, color: "#E91E63", bg: "#FCE4EC" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="font-display text-2xl font-bold text-[#0A2540]">Welcome back, {firstName}!</h1>
        <p className="text-sm text-[#6B7A8D] mt-1">Here's your overview.</p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-3 gap-4">
        {stats.map((s) => (
          <motion.div key={s.label} variants={staggerItem}>
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: s.bg }}>
                  <s.icon size={18} style={{ color: s.color }} />
                </div>
              </div>
              <p className="font-display text-2xl font-bold text-[#0A2540]">{s.value}</p>
              <p className="text-xs text-[#9BAAB8] mt-0.5">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* CTA Banner */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
        <div className="bg-gradient-to-r from-[#0A2540] to-[#0D3461] rounded-2xl p-5 text-white flex items-center justify-between gap-4">
          <div>
            <span className="text-xs text-[#00B4D8] font-semibold">Find your kit</span>
            <p className="font-display font-bold text-lg mt-0.5">University-Verified Equipment Packages</p>
            <p className="text-sm text-white/60">Select your university and year to get the exact list</p>
          </div>
          <div className="shrink-0 text-right">
            <Link href="/universities">
              <button className="mt-2 flex items-center gap-1.5 bg-[#00B4D8] hover:bg-[#48CAE4] text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer">
                Browse Packages <ArrowRight size={12} />
              </button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Recent Orders */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}>
        <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0]">
            <h2 className="font-display font-semibold text-[#0A2540]">Recent Orders</h2>
            <Link href="/dashboard/orders" className="text-xs text-[#00B4D8] hover:text-[#0A2540] font-medium transition-colors cursor-pointer flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {loading ? (
            <div className="px-5 py-8 text-center text-sm text-[#9BAAB8]">Loading orders…</div>
          ) : recentOrders.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <Package size={32} className="text-[#CBD5E0] mx-auto mb-2" />
              <p className="text-sm text-[#9BAAB8]">No orders yet</p>
              <Link href="/universities" className="text-xs text-[#00B4D8] font-medium mt-1 inline-block">
                Browse packages →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#F4F6F8]">
              {recentOrders.map((o) => {
                const itemName =
                  o.items?.[0]?.package?.name ??
                  o.items?.[0]?.product?.name ??
                  "Order";
                return (
                  <div key={o.id} className="flex items-center justify-between px-5 py-4 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#F4F6F8] flex items-center justify-center">
                        <Package size={15} className="text-[#6B7A8D]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#0A2540]">{itemName}</p>
                        <p className="text-xs text-[#9BAAB8]">
                          {o.orderNumber} • {new Date(o.createdAt).toLocaleDateString("en-EG", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-[#0A2540]">{formatPrice(o.totalAmount)}</p>
                      <div className="flex items-center gap-1 justify-end mt-0.5">
                        {statusIcon(o.status)}
                        <span className="text-xs text-[#6B7A8D]">{statusLabel(o.status)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
