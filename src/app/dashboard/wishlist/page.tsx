"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Heart, Package, ShoppingCart, Trash2, ArrowRight } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";

interface WishlistItem {
  id: string;
  createdAt: string;
  product: { id: string; name: string; slug: string; price: number; comparePrice: number | null } | null;
  package: { id: string; name: string; slug: string; price: number; comparePrice: number | null } | null;
}

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);
  const [addingCart, setAddingCart] = useState<string | null>(null);

  const fetchWishlist = async () => {
    const res = await fetch("/api/wishlist");
    const data = await res.json();
    if (data.success) setItems(data.data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchWishlist(); }, []);

  async function removeFromWishlist(productId?: string, packageId?: string) {
    const key = productId ?? packageId ?? "";
    setRemoving(key);
    await fetch("/api/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, packageId }),
    });
    await fetchWishlist();
    setRemoving(null);
    toast.success("Removed from wishlist");
  }

  async function addToCart(productId?: string, packageId?: string) {
    const key = productId ?? packageId ?? "";
    setAddingCart(key);
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, packageId, quantity: 1 }),
    });
    const data = await res.json();
    if (data.success) toast.success("Added to cart!");
    else toast.error(data.error ?? "Failed to add to cart");
    setAddingCart(null);
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="font-display text-2xl font-bold text-[#0A2540]">My Wishlist</h1>
        <p className="text-sm text-[#6B7A8D] mt-1">{items.length} saved item{items.length !== 1 ? "s" : ""}</p>
      </motion.div>

      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-white border border-[#E2E8F0] rounded-2xl animate-pulse" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] py-16 text-center">
          <Heart size={40} className="text-[#CBD5E0] mx-auto mb-3" />
          <p className="font-semibold text-[#0A2540] mb-1">Your wishlist is empty</p>
          <p className="text-sm text-[#9BAAB8] mb-4">Save packages and products you like.</p>
          <Link href="/packages">
            <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0A2540] text-white rounded-xl text-sm font-semibold hover:bg-[#0D3461] transition-colors cursor-pointer">
              Browse Packages <ArrowRight size={13} />
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {items.map((item, i) => {
            const entity = item.package ?? item.product;
            const href = item.package ? `/packages/${item.package.slug}` : `/products/${item.product?.slug}`;
            if (!entity) return null;
            const savings = entity.comparePrice ? Number(entity.comparePrice) - Number(entity.price) : 0;
            const productId = item.product?.id;
            const packageId = item.package?.id;
            const key = productId ?? packageId ?? "";

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl border border-[#E2E8F0] p-5 flex items-start gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-[#F4F6F8] flex items-center justify-center shrink-0">
                  <Package size={18} className="text-[#CBD5E0]" />
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={href} className="font-semibold text-[#0A2540] hover:text-[#00B4D8] transition-colors text-sm line-clamp-1">
                    {entity.name}
                  </Link>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-bold text-[#0A2540]">{formatPrice(Number(entity.price))}</span>
                    {entity.comparePrice && <span className="text-xs text-[#9BAAB8] line-through">{formatPrice(Number(entity.comparePrice))}</span>}
                    {savings > 0 && <span className="text-xs text-green-600 font-semibold">Save {formatPrice(savings)}</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => addToCart(productId, packageId)}
                      disabled={addingCart === key}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0A2540] text-white rounded-lg text-xs font-semibold hover:bg-[#0D3461] transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {addingCart === key ? <span className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" /> : <ShoppingCart size={11} />}
                      Add to Cart
                    </button>
                    <button
                      onClick={() => removeFromWishlist(productId, packageId)}
                      disabled={removing === key}
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E2E8F0] rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Trash2 size={11} /> Remove
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
