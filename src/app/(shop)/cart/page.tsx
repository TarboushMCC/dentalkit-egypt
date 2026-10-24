"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ShoppingCart, Trash2, Plus, Minus, Package, ArrowRight, Tag } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";

interface CartItem {
  id: string;
  quantity: number;
  product: { id: string; name: string; slug: string; price: number; comparePrice: number | null; images: string[]; stock: number } | null;
  package: { id: string; name: string; slug: string; price: number; comparePrice: number | null; images: string[]; stock: number } | null;
}

export default function CartPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchCart = useCallback(async () => {
    if (!session) return;
    const res = await fetch("/api/cart");
    const data = await res.json();
    if (data.success) {
      setItems(data.data.items);
      setTotal(data.data.total);
    }
    setLoading(false);
  }, [session]);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login?callbackUrl=/cart"); return; }
    if (status === "authenticated") fetchCart();
  }, [status, fetchCart, router]);

  async function updateQty(itemId: string, quantity: number) {
    if (quantity < 1) return removeItem(itemId);
    setUpdating(itemId);
    await fetch("/api/cart", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, quantity }),
    });
    await fetchCart();
    setUpdating(null);
  }

  async function removeItem(itemId: string) {
    setUpdating(itemId);
    await fetch(`/api/cart?itemId=${itemId}`, { method: "DELETE" });
    await fetchCart();
    setUpdating(null);
    toast.success("Item removed");
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen pt-24 pb-20 bg-[#FAFAF8]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 animate-pulse space-y-4">
          <div className="h-8 bg-[#E2E8F0] rounded w-1/4" />
          {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-white border border-[#E2E8F0] rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="font-display text-3xl font-bold text-[#0A2540] mb-2">Your Cart</h1>
          <p className="text-[#6B7A8D] mb-8">{items.length} {items.length === 1 ? "item" : "items"}</p>
        </motion.div>

        {items.length === 0 ? (
          <div className="text-center py-24">
            <ShoppingCart size={48} className="text-[#CBD5E0] mx-auto mb-4" />
            <h2 className="font-display font-bold text-xl text-[#0A2540] mb-2">Your cart is empty</h2>
            <p className="text-[#9BAAB8] mb-6">Find the right package for your university and year.</p>
            <Link href="/find-kit">
              <button className="inline-flex items-center gap-2 px-6 py-3 bg-[#0A2540] text-white rounded-xl font-semibold hover:bg-[#0D3461] transition-colors cursor-pointer">
                Find My Kit <ArrowRight size={15} />
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Items */}
            <div className="lg:col-span-2 space-y-3">
              {items.map((item) => {
                const entity = item.package ?? item.product;
                const href = item.package ? `/packages/${item.package.slug}` : `/products/${item.product?.slug}`;
                if (!entity) return null;
                const price = Number(entity.price);
                const comparePrice = entity.comparePrice ? Number(entity.comparePrice) : null;
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    className="bg-white rounded-2xl border border-[#E2E8F0] p-5 flex items-center gap-4"
                  >
                    {/* Icon */}
                    <div className="w-14 h-14 rounded-xl bg-[#F4F6F8] flex items-center justify-center shrink-0">
                      <Package size={22} className="text-[#CBD5E0]" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <Link href={href} className="font-semibold text-[#0A2540] hover:text-[#00B4D8] transition-colors text-sm line-clamp-1">
                        {entity.name}
                      </Link>
                      {item.package && <p className="text-xs text-[#9BAAB8] mt-0.5">Package</p>}
                      {item.product && <p className="text-xs text-[#9BAAB8] mt-0.5">Individual product</p>}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-bold text-[#0A2540]">{formatPrice(price)}</span>
                        {comparePrice && <span className="text-xs text-[#9BAAB8] line-through">{formatPrice(comparePrice)}</span>}
                      </div>
                    </div>

                    {/* Qty controls */}
                    <div className="flex items-center gap-2 border border-[#E2E8F0] rounded-xl p-1">
                      <button
                        onClick={() => updateQty(item.id, item.quantity - 1)}
                        disabled={updating === item.id}
                        className="w-7 h-7 flex items-center justify-center text-[#0A2540] hover:bg-[#F4F6F8] rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQty(item.id, item.quantity + 1)}
                        disabled={updating === item.id || item.quantity >= entity.stock}
                        className="w-7 h-7 flex items-center justify-center text-[#0A2540] hover:bg-[#F4F6F8] rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    {/* Line total */}
                    <p className="font-bold text-[#0A2540] text-sm w-20 text-right">{formatPrice(price * item.quantity)}</p>

                    {/* Remove */}
                    <button
                      onClick={() => removeItem(item.id)}
                      disabled={updating === item.id}
                      className="w-8 h-8 flex items-center justify-center text-[#9BAAB8] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </motion.div>
                );
              })}
            </div>

            {/* Summary */}
            <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 sticky top-24">
                <h2 className="font-display font-bold text-[#0A2540] text-lg mb-5">Order Summary</h2>

                <div className="space-y-3 mb-5">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6B7A8D]">Subtotal</span>
                    <span className="font-semibold text-[#0A2540]">{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6B7A8D]">Shipping</span>
                    <span className="text-green-600 font-medium">Free</span>
                  </div>
                  <div className="border-t border-[#E2E8F0] pt-3 flex justify-between">
                    <span className="font-bold text-[#0A2540]">Total</span>
                    <span className="font-display font-bold text-[#0A2540] text-lg">{formatPrice(total)}</span>
                  </div>
                </div>

                {/* Coupon */}
                <div className="flex gap-2 mb-5">
                  <div className="relative flex-1">
                    <Tag size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9BAAB8]" />
                    <input
                      type="text"
                      placeholder="Coupon code"
                      className="w-full pl-8 pr-3 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#00B4D8]"
                    />
                  </div>
                  <button className="px-3 py-2.5 bg-[#F4F6F8] rounded-xl text-sm font-medium text-[#0A2540] hover:bg-[#E2E8F0] transition-colors cursor-pointer">
                    Apply
                  </button>
                </div>

                <Link href="/checkout">
                  <button className="w-full py-3 bg-[#0A2540] hover:bg-[#0D3461] text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer">
                    Proceed to Checkout <ArrowRight size={15} />
                  </button>
                </Link>

                <Link href="/packages">
                  <button className="w-full mt-3 py-2.5 border border-[#E2E8F0] rounded-xl text-sm font-medium text-[#6B7A8D] hover:bg-[#F4F6F8] transition-colors cursor-pointer">
                    Continue Shopping
                  </button>
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
