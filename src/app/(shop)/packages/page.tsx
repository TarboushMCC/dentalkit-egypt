"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Filter, ShoppingCart, Star, Tag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice, calculateSavings } from "@/lib/utils";
import { staggerContainer, staggerItem } from "@/lib/motion";
import { toast } from "sonner";

interface Package {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice: number | null;
  stock: number;
  isRequired: boolean;
  isFeatured: boolean;
  university: { id: string; name: string; slug: string };
  year: { id: string; name: string; slug: string; yearNumber: number };
  _count: { items: number; reviews: number };
}

const yearOptions = ["All Years", "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Internship"];

export default function PackagesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [packages, setPackages] = useState<Package[]>([]);
  const [universities, setUniversities] = useState<{ name: string; slug: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingCart, setAddingCart] = useState<string | null>(null);

  const [selectedUni, setSelectedUni] = useState(searchParams.get("university") || "");
  const [selectedYear, setSelectedYear] = useState(searchParams.get("year") || "");
  const [sortBy, setSortBy] = useState("popular");

  // Fetch universities for filter
  useEffect(() => {
    fetch("/api/universities")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setUniversities(json.data.map((u: { name: string; slug: string }) => ({ name: u.name, slug: u.slug })));
      });
  }, []);

  // Fetch packages with filters
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedUni) params.set("university", selectedUni);
    if (selectedYear) params.set("year", selectedYear);
    params.set("limit", "50");

    fetch(`/api/packages?${params}`)
      .then((r) => r.json())
      .then((json) => { if (json.success) setPackages(json.data); })
      .finally(() => setLoading(false));
  }, [selectedUni, selectedYear]);

  // Sort
  const sorted = [...packages].sort((a, b) => {
    if (sortBy === "price-low") return Number(a.price) - Number(b.price);
    if (sortBy === "price-high") return Number(b.price) - Number(a.price);
    return 0;
  });

  async function addToCart(e: React.MouseEvent, pkgId: string, pkgPrice: number) {
    e.preventDefault();
    e.stopPropagation();
    if (!session) { router.push("/login"); return; }
    setAddingCart(pkgId);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId: pkgId, quantity: 1 }),
      });
      const data = await res.json();
      if (data.success) toast.success("Added to cart!");
      else toast.error(data.error ?? "Failed to add to cart");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setAddingCart(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-10">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#0A2540] mb-2">
            {selectedUni || selectedYear ? "Filtered Packages" : "All Packages"}
          </h1>
          <p className="text-[#6B7A8D]">
            {loading ? "Loading…" : `${sorted.length} packages — faculty-verified and ready to order.`}
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <motion.aside initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="lg:w-64 shrink-0">
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 sticky top-28">
              <h3 className="font-display font-semibold text-[#0A2540] mb-4 flex items-center gap-2">
                <Filter size={16} /> Filters
              </h3>

              <div className="mb-5">
                <p className="text-xs font-semibold text-[#9BAAB8] uppercase tracking-wide mb-2">University</p>
                <div className="space-y-1">
                  <button
                    onClick={() => setSelectedUni("")}
                    className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors cursor-pointer ${!selectedUni ? "bg-[#0A2540] text-white" : "text-[#1A1A2E]/70 hover:bg-[#F4F6F8]"}`}
                  >
                    All Universities
                  </button>
                  {universities.map((u) => (
                    <button
                      key={u.slug}
                      onClick={() => setSelectedUni(u.slug)}
                      className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors cursor-pointer ${selectedUni === u.slug ? "bg-[#0A2540] text-white" : "text-[#1A1A2E]/70 hover:bg-[#F4F6F8]"}`}
                    >
                      {u.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-[#9BAAB8] uppercase tracking-wide mb-2">Academic Year</p>
                <div className="space-y-1">
                  {yearOptions.map((y) => {
                    const slug = y === "All Years" ? "" : y.toLowerCase().replace(" ", "-");
                    return (
                      <button
                        key={y}
                        onClick={() => setSelectedYear(slug)}
                        className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors cursor-pointer ${selectedYear === slug ? "bg-[#0A2540] text-white" : "text-[#1A1A2E]/70 hover:bg-[#F4F6F8]"}`}
                      >
                        {y}
                      </button>
                    );
                  })}
                </div>
              </div>

              {(selectedUni || selectedYear) && (
                <button
                  onClick={() => { setSelectedUni(""); setSelectedYear(""); }}
                  className="mt-4 w-full text-sm text-[#00B4D8] hover:text-[#0A2540] font-medium transition-colors cursor-pointer"
                >
                  Clear filters
                </button>
              )}
            </div>
          </motion.aside>

          {/* Package Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-[#6B7A8D]">{sorted.length} results</p>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm border border-[#E2E8F0] rounded-lg px-3 py-2 bg-white text-[#1A1A2E] outline-none focus:border-[#00B4D8] cursor-pointer"
              >
                <option value="popular">Most Popular</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

            {loading ? (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {[...Array(6)].map((_, i) => <div key={i} className="h-72 bg-white border border-[#E2E8F0] rounded-2xl animate-pulse" />)}
              </div>
            ) : sorted.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-[#6B7A8D] mb-4">No packages found for these filters.</p>
                <Button onClick={() => { setSelectedUni(""); setSelectedYear(""); }} className="bg-[#0A2540] hover:bg-[#0D3461] text-white">Clear Filters</Button>
              </div>
            ) : (
              <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {sorted.map((pkg) => {
                  const price = Number(pkg.price);
                  const comparePrice = pkg.comparePrice ? Number(pkg.comparePrice) : null;
                  const { amount, percent } = calculateSavings(comparePrice ?? price, price);
                  return (
                    <motion.div key={pkg.id} variants={staggerItem} whileHover={{ y: -3 }} transition={{ duration: 0.15 }}>
                      <Link href={`/packages/${pkg.slug}`} className="group block h-full">
                        <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden hover:border-[#00B4D8]/30 hover:shadow-xl hover:shadow-[#0A2540]/6 transition-all duration-200 cursor-pointer h-full flex flex-col">
                          <div className="h-40 bg-gradient-to-br from-[#F4F6F8] to-[#E8EEF4] relative flex items-center justify-center">
                            <div className="w-20 h-20 rounded-xl bg-white/80 flex items-center justify-center border border-[#E2E8F0]">
                              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                                <rect x="3" y="3" width="18" height="18" rx="3" fill="#0A2540" opacity="0.08"/>
                                <path d="M9 7h6M9 12h6M9 17h4" stroke="#0A2540" strokeWidth="1.5" strokeLinecap="round"/>
                              </svg>
                            </div>
                            <span className={`absolute top-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-bold text-white ${pkg.isRequired ? "bg-[#0A2540]" : "bg-[#00B4D8]"}`}>
                              {pkg.isRequired ? "Required" : "Popular"}
                            </span>
                            {percent > 0 && (
                              <span className="absolute top-3 right-3 flex items-center gap-0.5 px-2 py-0.5 bg-green-50 text-green-700 rounded-full text-[10px] font-semibold border border-green-100">
                                <Tag size={8} /> {percent}% off
                              </span>
                            )}
                          </div>
                          <div className="p-4 flex flex-col flex-1">
                            <p className="text-xs text-[#9BAAB8] mb-1">{pkg.university.name} • {pkg.year.name}</p>
                            <h3 className="font-display font-bold text-[#0A2540] text-sm mb-2 group-hover:text-[#00B4D8] transition-colors leading-snug">{pkg.name}</h3>
                            <p className="text-xs text-[#9BAAB8]">{pkg._count.items} items included</p>
                            <div className="mt-auto pt-3">
                              <div className="flex items-end justify-between mb-3">
                                <div>
                                  <p className="font-display font-bold text-[#0A2540] text-lg">{formatPrice(price)}</p>
                                  {comparePrice && <p className="text-xs text-[#9BAAB8] line-through">{formatPrice(comparePrice)}</p>}
                                </div>
                                {amount > 0 && <span className="text-xs text-green-700 font-semibold bg-green-50 px-2 py-0.5 rounded">Save {formatPrice(amount)}</span>}
                              </div>
                              <button
                                onClick={(e) => addToCart(e, pkg.id, price)}
                                disabled={addingCart === pkg.id || pkg.stock === 0}
                                className="w-full flex items-center justify-center gap-1.5 bg-[#0A2540] hover:bg-[#0D3461] text-white rounded-xl py-2 text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50"
                              >
                                {addingCart === pkg.id ? (
                                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                ) : (
                                  <><ShoppingCart size={13} /> {pkg.stock === 0 ? "Out of Stock" : "Add to Cart"}</>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
