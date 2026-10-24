"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Package, CheckCircle2, Clock, Truck, XCircle, ArrowRight } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  createdAt: string;
  shippingAddress: string | null;
  shippingCity: string | null;
  items: { id: string; name: string; quantity: number; price: number }[];
}

const statusConfig: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  PENDING:    { label: "Pending",    icon: <Clock size={12} />,        color: "text-amber-700", bg: "bg-amber-50 border-amber-100" },
  CONFIRMED:  { label: "Confirmed",  icon: <CheckCircle2 size={12} />, color: "text-indigo-700", bg: "bg-indigo-50 border-indigo-100" },
  PROCESSING: { label: "Processing", icon: <Clock size={12} />,        color: "text-blue-700",   bg: "bg-blue-50 border-blue-100" },
  SHIPPED:    { label: "Shipped",    icon: <Truck size={12} />,        color: "text-blue-700",   bg: "bg-blue-50 border-blue-100" },
  DELIVERED:  { label: "Delivered",  icon: <CheckCircle2 size={12} />, color: "text-green-700",  bg: "bg-green-50 border-green-100" },
  CANCELLED:  { label: "Cancelled",  icon: <XCircle size={12} />,      color: "text-red-600",    bg: "bg-red-50 border-red-100" },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((json) => { if (json.success) setOrders(json.orders ?? []); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="font-display text-2xl font-bold text-[#0A2540]">My Orders</h1>
        <p className="text-sm text-[#6B7A8D] mt-1">Track and manage your orders.</p>
      </motion.div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-28 bg-white border border-[#E2E8F0] rounded-2xl animate-pulse" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] py-16 text-center">
          <Package size={40} className="text-[#CBD5E0] mx-auto mb-3" />
          <p className="font-semibold text-[#0A2540] mb-1">No orders yet</p>
          <p className="text-sm text-[#9BAAB8] mb-4">When you place an order, it will appear here.</p>
          <Link href="/find-kit">
            <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0A2540] text-white rounded-xl text-sm font-semibold hover:bg-[#0D3461] transition-colors cursor-pointer">
              Find My Kit <ArrowRight size={13} />
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order, i) => {
            const cfg = statusConfig[order.status] ?? statusConfig.PENDING;
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl border border-[#E2E8F0] p-5"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm font-bold text-[#0A2540]">{order.orderNumber}</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${cfg.bg} ${cfg.color}`}>
                        {cfg.icon} {cfg.label}
                      </span>
                    </div>
                    <p className="text-xs text-[#9BAAB8]">
                      {new Date(order.createdAt).toLocaleDateString("en-EG", { year: "numeric", month: "long", day: "numeric" })}
                      {order.shippingCity && ` · ${order.shippingCity}`}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-display font-bold text-[#0A2540]">{formatPrice(order.totalAmount)}</p>
                    <p className={`text-[10px] font-semibold mt-0.5 ${order.paymentStatus === "PAID" ? "text-green-600" : "text-amber-600"}`}>
                      {order.paymentStatus}
                    </p>
                  </div>
                </div>

                {order.items && order.items.length > 0 && (
                  <div className="space-y-1.5">
                    {order.items.slice(0, 2).map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-xs text-[#6B7A8D]">
                        <span className="flex items-center gap-1.5">
                          <Package size={10} className="text-[#CBD5E0]" />
                          {item.name} ×{item.quantity}
                        </span>
                        <span>{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <p className="text-xs text-[#9BAAB8]">+{order.items.length - 2} more item(s)</p>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
