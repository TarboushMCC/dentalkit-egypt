"use client";

import { useEffect, useState, use } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ShoppingCart, Heart, CheckCircle2, Star,
  Package, Tag, ArrowRight, Truck, Shield, RotateCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatPrice, calculateSavings } from "@/lib/utils";
import { staggerContainer, staggerItem } from "@/lib/motion";
import { toast } from "sonner";

interface PackageDetail {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  comparePrice: number | null;
  stock: number;
  isRequired: boolean;
  isFeatured: boolean;
  university: { id: string; name: string; slug: string };
  year: { id: string; name: string; slug: string; yearNumber: number };
  items: {
    id: string;
    quantity: number;
    note: string | null;
    product: { id: string; name: string; slug: string; price: number; description: string | null } | null;
  }[];
  reviews: { id: string; rating: number; user: { name: string | null; image: string | null } }[];
  _count: { items: number; reviews: number };
}

const guarantees = [
  { icon: Truck, label: "Free Delivery", desc: "On orders above EGP 500" },
  { icon: Shield, label: "Faculty Verified", desc: "Official equipment lists" },
  { icon: RotateCcw, label: "14-Day Returns", desc: "For unopened items" },
];

export default function PackageDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data: session } = useSession();
  const router = useRouter();

  const [pkg, setPkg] = useState<PackageDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [addingCart, setAddingCart] = useState(false);
  const [togglingWish, setTogglingWish] = useState(false);

  useEffect(() => {
    fetch(`/api/packages/${slug}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setPkg(json.data);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  // Check wishlist status
  useEffect(() => {
    if (!session || !pkg) return;
    fetch("/api/wishlist")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setWishlisted(json.data.some((item: { package?: { id: string } }) => item.package?.id === pkg.id));
        }
      });
  }, [session, pkg]);

  async function handleAddToCart() {
    if (!session) { router.push("/login"); return; }
    if (!pkg) return;
    setAddingCart(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId: pkg.id, quantity: qty }),
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
      setAddingCart(false);
    }
  }

  async function handleBuyNow() {
    if (!session) { router.push("/login"); return; }
    if (!pkg) return;
    setAddingCart(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId: pkg.id, quantity: qty }),
      });
      const data = await res.json();
      if (data.success) {
        router.push("/checkout");
      } else {
        toast.error(data.error ?? "Failed to proceed");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setAddingCart(false);
    }
  }

  async function toggleWishlist() {
    if (!session) { router.push("/login"); return; }
    if (!pkg) return;
    setTogglingWish(true);
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId: pkg.id }),
      });
      const data = await res.json();
      if (data.success) {
        setWishlisted(data.action === "added");
        toast.success(data.action === "added" ? "Saved to wishlist!" : "Removed from wishlist");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setTogglingWish(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-pulse">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="aspect-square bg-[#E2E8F0] rounded-3xl" />
            <div className="space-y-4">
              <div className="h-6 bg-[#E2E8F0] rounded w-1/3" />
              <div className="h-10 bg-[#E2E8F0] rounded w-3/4" />
              <div className="h-32 bg-[#E2E8F0] rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] pt-32 text-center">
        <Package size={48} className="text-[#CBD5E0] mx-auto mb-4" />
        <h1 className="font-display font-bold text-xl text-[#0A2540] mb-2">Package not found</h1>
        <Link href="/packages" className="text-[#00B4D8] text-sm">← Back to packages</Link>
      </div>
    );
  }

  const price = Number(pkg.price);
  const comparePrice = pkg.comparePrice ? Number(pkg.comparePrice) : null;
  const { amount: savings, percent } = calculateSavings(comparePrice ?? price, price);
  const avgRating = pkg.reviews.length > 0
    ? pkg.reviews.reduce((s, r) => s + r.rating, 0) / pkg.reviews.length
    : 0;

  return (
    <div className="min-h-screen bg-[#FAFAF8] pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#9BAAB8] mb-8">
          <Link href="/" className="hover:text-[#0A2540] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/packages" className="hover:text-[#0A2540] transition-colors">Packages</Link>
          <span>/</span>
          <Link href={`/universities/${pkg.university.slug}`} className="hover:text-[#0A2540] transition-colors">{pkg.university.name}</Link>
          <span>/</span>
          <span className="text-[#1A1A2E]">{pkg.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left — Visual */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <div className="rounded-3xl overflow-hidden bg-gradient-to-br from-[#F4F6F8] to-[#E0EBF5] aspect-square flex items-center justify-center relative">
              <div className="w-56 h-56 rounded-3xl bg-white/80 border border-[#E2E8F0] shadow-lg flex items-center justify-center">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="2" width="20" height="20" rx="4" fill="#0A2540" opacity="0.06"/>
                  <path d="M8 6h8M8 10h8M8 14h5" stroke="#0A2540" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="6" cy="6" r="1" fill="#00B4D8"/>
                  <circle cx="6" cy="10" r="1" fill="#00B4D8"/>
                  <circle cx="6" cy="14" r="1" fill="#00B4D8"/>
                </svg>
              </div>
              {pkg.isRequired && (
                <div className="absolute top-4 left-4 px-3 py-1.5 bg-[#0A2540] text-white text-xs font-bold rounded-full">
                  Required Package
                </div>
              )}
              {percent > 0 && (
                <div className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white text-xs font-bold rounded-full">
                  <Tag size={10} /> Save {percent}%
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className={`w-16 h-16 rounded-xl bg-[#F4F6F8] border-2 ${i === 0 ? "border-[#00B4D8]" : "border-[#E2E8F0]"} cursor-pointer flex items-center justify-center`}>
                  <Package size={16} className="text-[#9BAAB8]" />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="flex flex-col">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {pkg.isRequired && <span className="px-2.5 py-1 rounded-full bg-[#0A2540] text-white text-xs font-bold">Required</span>}
              <span className="px-2.5 py-1 rounded-full bg-[#F4F6F8] text-[#6B7A8D] text-xs">{pkg.university.name}</span>
              <span className="px-2.5 py-1 rounded-full bg-[#F4F6F8] text-[#6B7A8D] text-xs">{pkg.year.name}</span>
            </div>

            <h1 className="font-display text-3xl font-bold text-[#0A2540] mb-3 leading-tight">{pkg.name}</h1>

            {(avgRating > 0 || pkg._count.reviews > 0) && (
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className={i < Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "text-[#E2E8F0]"} />
                  ))}
                </div>
                <span className="text-sm text-[#6B7A8D]">{avgRating.toFixed(1)} ({pkg._count.reviews} reviews)</span>
                <span className="text-xs text-green-600 font-medium">{pkg.stock} in stock</span>
              </div>
            )}

            {pkg.description && <p className="text-sm text-[#6B7A8D] leading-relaxed mb-6">{pkg.description}</p>}

            {/* Pricing card */}
            <div className="bg-[#F4F6F8] rounded-2xl p-5 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-[#9BAAB8] mb-1">Package Price</p>
                  <p className="font-display text-4xl font-bold text-[#0A2540]">{formatPrice(price)}</p>
                  {comparePrice && (
                    <p className="text-sm text-[#9BAAB8] line-through mt-0.5">
                      {formatPrice(comparePrice)} if bought individually
                    </p>
                  )}
                </div>
                {savings > 0 && (
                  <div className="text-right">
                    <p className="text-xs text-[#9BAAB8] mb-1">Your savings</p>
                    <p className="font-display text-2xl font-bold text-green-600">{formatPrice(savings)}</p>
                    <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded">{percent}% off</span>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-3 gap-3 text-center py-3 border-t border-[#E2E8F0]">
                <div>
                  <p className="font-semibold text-[#0A2540]">{pkg._count.items}</p>
                  <p className="text-xs text-[#9BAAB8]">Items</p>
                </div>
                <div>
                  <p className="font-semibold text-[#0A2540]">{pkg.year.name}</p>
                  <p className="text-xs text-[#9BAAB8]">Academic Year</p>
                </div>
                <div>
                  <p className="font-semibold text-[#0A2540]">2–3 Days</p>
                  <p className="text-xs text-[#9BAAB8]">Delivery</p>
                </div>
              </div>
            </div>

            {/* Qty + CTA */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-2 border border-[#E2E8F0] rounded-xl p-1 bg-white">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-8 h-8 flex items-center justify-center text-[#0A2540] hover:bg-[#F4F6F8] rounded-lg transition-colors cursor-pointer font-bold">-</button>
                <span className="w-8 text-center text-sm font-semibold text-[#0A2540]">{qty}</span>
                <button onClick={() => setQty(Math.min(pkg.stock, qty + 1))} className="w-8 h-8 flex items-center justify-center text-[#0A2540] hover:bg-[#F4F6F8] rounded-lg transition-colors cursor-pointer font-bold">+</button>
              </div>
              <Button
                onClick={handleAddToCart}
                disabled={addingCart || pkg.stock === 0}
                className="flex-1 bg-[#0A2540] hover:bg-[#0D3461] text-white rounded-xl py-3 font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {addingCart ? (
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <><ShoppingCart size={16} /> Add to Cart — {formatPrice(price * qty)}</>
                )}
              </Button>
              <button
                onClick={toggleWishlist}
                disabled={togglingWish}
                aria-label="Wishlist"
                className={`w-11 h-11 rounded-xl border flex items-center justify-center transition-colors cursor-pointer ${wishlisted ? "border-red-300 bg-red-50 text-red-500" : "border-[#E2E8F0] bg-white text-[#9BAAB8] hover:border-red-200 hover:text-red-400"}`}
              >
                <Heart size={16} className={wishlisted ? "fill-current" : ""} />
              </button>
            </div>

            <button
              onClick={handleBuyNow}
              disabled={addingCart || pkg.stock === 0}
              className="w-full py-3 rounded-xl border-2 border-[#0A2540] text-[#0A2540] text-sm font-semibold hover:bg-[#0A2540] hover:text-white transition-colors cursor-pointer disabled:opacity-50 mb-6"
            >
              {pkg.stock === 0 ? "Out of Stock" : "Buy Now"}
            </button>

            {/* Guarantees */}
            <div className="grid grid-cols-3 gap-3">
              {guarantees.map(({ icon: Icon, label, desc }) => (
                <div key={label} className="text-center p-3 bg-white rounded-xl border border-[#E2E8F0]">
                  <Icon size={18} className="text-[#00B4D8] mx-auto mb-1.5" />
                  <p className="text-xs font-semibold text-[#0A2540]">{label}</p>
                  <p className="text-[10px] text-[#9BAAB8] leading-tight mt-0.5">{desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Package Contents */}
        {pkg.items.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="mt-16">
            <h2 className="font-display text-2xl font-bold text-[#0A2540] mb-6">What's Included ({pkg._count.items} items)</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pkg.items.map((item, i) => (
                <motion.div key={item.id} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.3, delay: i * 0.04 }} className="bg-white rounded-xl border border-[#E2E8F0] p-4 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#00B4D8]/10 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 size={14} className="text-[#00B4D8]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#0A2540]">
                      {item.product?.name ?? "Item"}
                      {item.quantity > 1 && <span className="text-[#00B4D8]"> ×{item.quantity}</span>}
                    </p>
                    {item.note && <p className="text-xs text-[#9BAAB8] mt-0.5 leading-relaxed">{item.note}</p>}
                    {item.product?.description && !item.note && (
                      <p className="text-xs text-[#9BAAB8] mt-0.5 leading-relaxed line-clamp-2">{item.product.description}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Savings Breakdown */}
        {comparePrice && savings > 0 && (
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="mt-12 bg-gradient-to-br from-[#0A2540] to-[#0D3461] rounded-3xl p-8 text-white">
            <h2 className="font-display text-2xl font-bold mb-6">Savings Breakdown</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white/10 rounded-2xl p-5">
                <p className="text-sm text-white/60 mb-1">Buying Individually</p>
                <p className="font-display text-3xl font-bold">{formatPrice(comparePrice)}</p>
                <p className="text-xs text-white/50 mt-1">at retail prices</p>
              </div>
              <div className="bg-[#00B4D8] rounded-2xl p-5">
                <p className="text-sm text-white/80 mb-1">Package Price</p>
                <p className="font-display text-3xl font-bold">{formatPrice(price)}</p>
                <p className="text-xs text-white/70 mt-1">all {pkg._count.items} items included</p>
              </div>
              <div className="bg-white/10 rounded-2xl p-5">
                <p className="text-sm text-white/60 mb-1">Your Savings</p>
                <p className="font-display text-3xl font-bold text-green-400">{formatPrice(savings)}</p>
                <p className="text-xs text-green-400/70 mt-1">{percent}% off retail</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
