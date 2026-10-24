"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Package, CheckCircle2, ArrowLeft, Tag } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";

interface CartItem {
  id: string;
  quantity: number;
  product: { id: string; name: string; price: number } | null;
  package: { id: string; name: string; price: number } | null;
}

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState<{ code: string; discount: number } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const [form, setForm] = useState({
    shippingName: session?.user?.name ?? "",
    shippingPhone: "",
    shippingAddress: "",
    shippingCity: "Cairo",
    shippingGov: "Cairo",
    notes: "",
    paymentMethod: "instapay" as "instapay" | "cod",
  });

  const fetchCart = useCallback(async () => {
    const res = await fetch("/api/cart");
    const data = await res.json();
    if (data.success) {
      setCartItems(data.data.items);
      setCartTotal(data.data.total);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login?callbackUrl=/checkout"); return; }
    if (status === "authenticated") {
      setForm((f) => ({ ...f, shippingName: session?.user?.name ?? "" }));
      fetchCart();
    }
  }, [status, session, fetchCart, router]);

  async function applyCoupon() {
    if (!coupon.trim()) return;
    setCouponLoading(true);
    try {
      const res = await fetch(`/api/coupons/validate?code=${encodeURIComponent(coupon)}&total=${cartTotal}`);
      const data = await res.json();
      if (data.success) {
        setCouponApplied({ code: coupon.toUpperCase(), discount: data.data.discountAmount });
        toast.success(`Coupon applied! You save ${formatPrice(data.data.discountAmount)}`);
      } else {
        toast.error(data.error ?? "Invalid coupon");
      }
    } catch {
      toast.error("Failed to validate coupon");
    } finally {
      setCouponLoading(false);
    }
  }

  async function placeOrder() {
    if (!form.shippingPhone || !form.shippingAddress) {
      toast.error("Please fill in all required fields");
      return;
    }
    setPlacing(true);
    try {
      const items = cartItems.map((item) => ({
        productId: item.product?.id,
        packageId: item.package?.id,
        name: item.product?.name ?? item.package?.name ?? "Item",
        quantity: item.quantity,
        price: Number(item.product?.price ?? item.package?.price ?? 0),
      }));

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, items, couponCode: couponApplied?.code }),
      });
      const data = await res.json();

      if (data.success) {
        // Clear cart
        await fetch("/api/cart?clear=true", { method: "DELETE" });
        toast.success("Order placed successfully!");
        router.push(`/dashboard/orders`);
      } else {
        toast.error(data.error ?? "Failed to place order");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setPlacing(false);
    }
  }

  const finalTotal = cartTotal - (couponApplied?.discount ?? 0);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen pt-24 pb-20 bg-[#FAFAF8] animate-pulse">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-8 bg-[#E2E8F0] rounded w-1/4 mb-8" />
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-4"><div className="h-64 bg-white border border-[#E2E8F0] rounded-2xl" /></div>
            <div className="h-64 bg-white border border-[#E2E8F0] rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen pt-32 pb-20 text-center bg-[#FAFAF8]">
        <Package size={48} className="text-[#CBD5E0] mx-auto mb-4" />
        <h2 className="font-display font-bold text-xl text-[#0A2540] mb-2">Your cart is empty</h2>
        <Link href="/packages" className="text-[#00B4D8] text-sm">Browse packages →</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <Link href="/cart" className="inline-flex items-center gap-1.5 text-sm text-[#6B7A8D] hover:text-[#0A2540] mb-6 transition-colors cursor-pointer">
            <ArrowLeft size={13} /> Back to Cart
          </Link>
          <h1 className="font-display text-3xl font-bold text-[#0A2540] mb-8">Checkout</h1>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Shipping form */}
          <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="space-y-5">
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
              <h2 className="font-display font-bold text-[#0A2540] text-lg mb-4">Shipping Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#6B7A8D] mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    value={form.shippingName}
                    onChange={(e) => setForm({ ...form, shippingName: e.target.value })}
                    placeholder="Your full name"
                    className="w-full px-3.5 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#00B4D8] bg-[#F4F6F8]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6B7A8D] mb-1.5">Phone Number *</label>
                  <input
                    type="tel"
                    value={form.shippingPhone}
                    onChange={(e) => setForm({ ...form, shippingPhone: e.target.value })}
                    placeholder="01xxxxxxxxx"
                    className="w-full px-3.5 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#00B4D8] bg-[#F4F6F8]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6B7A8D] mb-1.5">Address *</label>
                  <input
                    type="text"
                    value={form.shippingAddress}
                    onChange={(e) => setForm({ ...form, shippingAddress: e.target.value })}
                    placeholder="Street address, apartment..."
                    className="w-full px-3.5 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#00B4D8] bg-[#F4F6F8]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#6B7A8D] mb-1.5">City *</label>
                    <input
                      type="text"
                      value={form.shippingCity}
                      onChange={(e) => setForm({ ...form, shippingCity: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#00B4D8] bg-[#F4F6F8]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#6B7A8D] mb-1.5">Governorate *</label>
                    <input
                      type="text"
                      value={form.shippingGov}
                      onChange={(e) => setForm({ ...form, shippingGov: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#00B4D8] bg-[#F4F6F8]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6B7A8D] mb-1.5">Notes (optional)</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    rows={2}
                    placeholder="Any special delivery instructions..."
                    className="w-full px-3.5 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#00B4D8] bg-[#F4F6F8] resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Payment method */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6">
              <h2 className="font-display font-bold text-[#0A2540] text-lg mb-4">Payment Method</h2>
              <div className="space-y-3">
                {[
                  { value: "instapay", label: "InstaPay", desc: "Pay instantly via InstaPay" },
                  { value: "cod", label: "Cash on Delivery", desc: "Pay when you receive" },
                ].map((method) => (
                  <label key={method.value} className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-colors ${form.paymentMethod === method.value ? "border-[#0A2540] bg-[#0A2540]/5" : "border-[#E2E8F0] hover:border-[#CBD5E0]"}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.value}
                      checked={form.paymentMethod === method.value}
                      onChange={(e) => setForm({ ...form, paymentMethod: e.target.value as "instapay" | "cod" })}
                      className="accent-[#0A2540]"
                    />
                    <div>
                      <p className="text-sm font-semibold text-[#0A2540]">{method.label}</p>
                      <p className="text-xs text-[#9BAAB8]">{method.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right: Order summary */}
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 sticky top-24">
              <h2 className="font-display font-bold text-[#0A2540] text-lg mb-4">Order Summary</h2>

              {/* Items */}
              <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                {cartItems.map((item) => {
                  const entity = item.package ?? item.product;
                  if (!entity) return null;
                  return (
                    <div key={item.id} className="flex items-center justify-between text-sm gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-[#F4F6F8] flex items-center justify-center shrink-0">
                          <Package size={12} className="text-[#9BAAB8]" />
                        </div>
                        <span className="text-[#0A2540] truncate">{entity.name}</span>
                        <span className="text-[#9BAAB8] shrink-0">×{item.quantity}</span>
                      </div>
                      <span className="font-semibold text-[#0A2540] shrink-0">{formatPrice(Number(entity.price) * item.quantity)}</span>
                    </div>
                  );
                })}
              </div>

              {/* Coupon */}
              <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                  <Tag size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9BAAB8]" />
                  <input
                    type="text"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    placeholder="Coupon code (try WELCOME20)"
                    className="w-full pl-8 pr-3 py-2 border border-[#E2E8F0] rounded-xl text-xs focus:outline-none focus:border-[#00B4D8]"
                    disabled={!!couponApplied}
                  />
                </div>
                <button
                  onClick={couponApplied ? () => { setCouponApplied(null); setCoupon(""); } : applyCoupon}
                  disabled={couponLoading}
                  className="px-3 py-2 bg-[#F4F6F8] rounded-xl text-xs font-medium text-[#0A2540] hover:bg-[#E2E8F0] transition-colors cursor-pointer disabled:opacity-50"
                >
                  {couponApplied ? "Remove" : couponLoading ? "..." : "Apply"}
                </button>
              </div>

              {/* Totals */}
              <div className="space-y-2 border-t border-[#E2E8F0] pt-4 mb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-[#6B7A8D]">Subtotal</span>
                  <span className="font-medium">{formatPrice(cartTotal)}</span>
                </div>
                {couponApplied && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Coupon ({couponApplied.code})</span>
                    <span>-{formatPrice(couponApplied.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-[#6B7A8D]">Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                <div className="flex justify-between font-bold text-[#0A2540] text-base border-t border-[#E2E8F0] pt-2 mt-2">
                  <span>Total</span>
                  <span>{formatPrice(finalTotal)}</span>
                </div>
              </div>

              <button
                onClick={placeOrder}
                disabled={placing}
                className="w-full py-3 bg-[#0A2540] hover:bg-[#0D3461] text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-60"
              >
                {placing ? (
                  <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Placing order…</span>
                ) : (
                  <><CheckCircle2 size={16} /> Place Order — {formatPrice(finalTotal)}</>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
