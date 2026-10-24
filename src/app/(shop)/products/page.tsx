"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ShoppingCart, Heart, Search, Package, Star, Tag } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { staggerContainer, staggerItem } from "@/lib/motion";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice: number | null;
  images: string[];
  stock: number;
  isFeatured: boolean;
  category: { id: string; name: string; slug: string } | null;
  _count: { reviews: number };
}

export default function ProductsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [addingCart, setAddingCart] = useState<string | null>(null);

  useEffect(() => {
    const q = search ? `?q=${encodeURIComponent(search)}` : "";
    fetch(`/api/products${q}`)
      .then((r) => r.json())
      .then((json) => { if (json.success) setProducts(json.data); })
      .finally(() => setLoading(false));
  }, [search]);

  async function addToCart(productId: string) {
    if (!session) { router.push("/login"); return; }
    setAddingCart(productId);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Added to cart!");
      } else {
        toast.error(data.error ?? "Failed to add to cart");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setAddingCart(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-10">
          <h1 className="font-display text-3xl font-bold text-[#0A2540] mb-2">Individual Products</h1>
          <p className="text-[#6B7A8D]">Browse individual dental instruments and equipment.</p>
        </motion.div>

        {/* Search */}
        <div className="relative max-w-sm mb-8">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9BAAB8]" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#00B4D8] transition-colors"
          />
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => <div key={i} className="h-64 bg-white border border-[#E2E8F0] rounded-2xl animate-pulse" />)}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <Package size={40} className="text-[#CBD5E0] mx-auto mb-3" />
            <p className="text-[#9BAAB8]">No products found{search ? ` for "${search}"` : ""}.</p>
            <Link href="/packages" className="text-[#00B4D8] text-sm mt-1 inline-block">Browse packages instead →</Link>
          </div>
        ) : (
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {products.map((product) => {
              const savings = product.comparePrice ? Number(product.comparePrice) - Number(product.price) : 0;
              const savingsPct = product.comparePrice ? Math.round((savings / Number(product.comparePrice)) * 100) : 0;
              return (
                <motion.div key={product.id} variants={staggerItem}>
                  <div className="group bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden hover:border-[#00B4D8] hover:shadow-md transition-all duration-200 flex flex-col h-full">
                    {/* Image */}
                    <div className="relative h-40 bg-gradient-to-br from-[#F4F6F8] to-[#E0EBF5] flex items-center justify-center">
                      <Package size={32} className="text-[#CBD5E0]" />
                      {savingsPct > 0 && (
                        <span className="absolute top-2 left-2 flex items-center gap-0.5 text-[10px] font-bold bg-green-500 text-white px-2 py-0.5 rounded-full">
                          <Tag size={8} />-{savingsPct}%
                        </span>
                      )}
                      {product.isFeatured && (
                        <span className="absolute top-2 right-2 text-[10px] font-bold bg-[#0A2540] text-white px-2 py-0.5 rounded-full">Featured</span>
                      )}
                    </div>

                    <div className="p-4 flex flex-col flex-1">
                      {product.category && (
                        <p className="text-[10px] text-[#00B4D8] font-semibold uppercase tracking-wide mb-1">{product.category.name}</p>
                      )}
                      <h3 className="text-sm font-semibold text-[#0A2540] mb-1 line-clamp-2">{product.name}</h3>

                      <div className="mt-auto">
                        <div className="flex items-end justify-between mb-3">
                          <div>
                            <p className="font-bold text-[#0A2540]">{formatPrice(Number(product.price))}</p>
                            {product.comparePrice && (
                              <p className="text-xs text-[#9BAAB8] line-through">{formatPrice(Number(product.comparePrice))}</p>
                            )}
                          </div>
                          <span className="text-xs text-[#9BAAB8]">{product.stock > 0 ? "In stock" : "Out of stock"}</span>
                        </div>

                        <button
                          onClick={() => addToCart(product.id)}
                          disabled={product.stock === 0 || addingCart === product.id}
                          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#0A2540] text-white text-sm font-semibold hover:bg-[#0D3461] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        >
                          {addingCart === product.id ? (
                            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          ) : (
                            <><ShoppingCart size={14} /> Add to Cart</>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}
