"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { ArrowRight, ShoppingCart, Star, Tag } from "lucide-react";
import { staggerContainer, staggerItem } from "@/lib/motion";
import { formatPrice, calculateSavings } from "@/lib/utils";

const packages = [
  {
    slug: "cairo-year-1-starter-kit",
    name: "First Year Starter Kit",
    university: "Cairo University",
    year: "Year 1",
    price: 1850,
    comparePrice: 2600,
    items: 12,
    rating: 4.9,
    reviews: 234,
    badge: "Best Seller",
    badgeColor: "#00B4D8",
    image: null,
  },
  {
    slug: "ain-shams-year-2-clinical",
    name: "Second Year Clinical Kit",
    university: "Ain Shams University",
    year: "Year 2",
    price: 2850,
    comparePrice: 4200,
    items: 18,
    rating: 4.8,
    reviews: 187,
    badge: "Most Complete",
    badgeColor: "#0A2540",
    image: null,
  },
  {
    slug: "alex-year-3-operative",
    name: "Third Year Operative Kit",
    university: "Alexandria University",
    year: "Year 3",
    price: 3200,
    comparePrice: 4800,
    items: 22,
    rating: 4.9,
    reviews: 156,
    badge: "Faculty Verified",
    badgeColor: "#00B4D8",
    image: null,
  },
  {
    slug: "future-uni-year-1-basic",
    name: "Year 1 Basic Instruments",
    university: "Future University",
    year: "Year 1",
    price: 1600,
    comparePrice: 2200,
    items: 10,
    rating: 4.7,
    reviews: 98,
    badge: "New",
    badgeColor: "#059669",
    image: null,
  },
];

function PackageCard({ pkg }: { pkg: typeof packages[0] }) {
  const { amount, percent } = calculateSavings(pkg.comparePrice, pkg.price);

  return (
    <motion.div variants={staggerItem} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <Link href={`/packages/${pkg.slug}`} className="group block">
        <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden hover:border-[#00B4D8]/30 hover:shadow-xl hover:shadow-[#0A2540]/8 transition-all duration-300 cursor-pointer h-full flex flex-col">
          {/* Image area */}
          <div className="relative h-48 bg-gradient-to-br from-[#F4F6F8] to-[#E8EEF4] overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 rounded-2xl bg-white/80 border border-[#E2E8F0] flex items-center justify-center shadow-sm">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="3" fill="#0A2540" opacity="0.08"/>
                  <path d="M9 7h6M9 12h6M9 17h4" stroke="#0A2540" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
            </div>
            {/* Badge */}
            <span
              className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-white text-[10px] font-bold"
              style={{ background: pkg.badgeColor }}
            >
              {pkg.badge}
            </span>
            {/* Savings tag */}
            {percent > 0 && (
              <span className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-semibold border border-green-100">
                <Tag size={9} /> Save {percent}%
              </span>
            )}
          </div>

          {/* Content */}
          <div className="p-5 flex flex-col flex-1">
            <div className="text-xs text-[#9BAAB8] mb-1.5">
              {pkg.university} • {pkg.year}
            </div>
            <h3 className="font-display font-bold text-[#0A2540] text-base mb-2 group-hover:text-[#00B4D8] transition-colors leading-snug">
              {pkg.name}
            </h3>

            <div className="flex items-center gap-1.5 mb-4">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={11}
                    className={i < Math.floor(pkg.rating) ? "fill-amber-400 text-amber-400" : "text-[#E2E8F0]"}
                  />
                ))}
              </div>
              <span className="text-xs text-[#6B7A8D]">{pkg.rating} ({pkg.reviews})</span>
              <span className="text-xs text-[#C8D4DE]">•</span>
              <span className="text-xs text-[#6B7A8D]">{pkg.items} items</span>
            </div>

            <div className="mt-auto">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-display font-bold text-[#0A2540] text-xl">
                    {formatPrice(pkg.price)}
                  </p>
                  {pkg.comparePrice > pkg.price && (
                    <p className="text-xs text-[#9BAAB8] line-through">
                      {formatPrice(pkg.comparePrice)}
                    </p>
                  )}
                </div>
                {amount > 0 && (
                  <span className="text-xs text-green-700 font-semibold bg-green-50 px-2 py-1 rounded-lg">
                    Save {formatPrice(amount)}
                  </span>
                )}
              </div>

              <button className="w-full flex items-center justify-center gap-2 bg-[#0A2540] hover:bg-[#0D3461] text-white rounded-xl py-2.5 text-sm font-semibold transition-colors cursor-pointer">
                <ShoppingCart size={14} />
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function PopularPackages() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-4"
        >
          <div>
            <span className="inline-block px-3 py-1.5 rounded-full bg-[#00B4D8]/10 text-[#00B4D8] text-xs font-semibold tracking-wide mb-3">
              Top Packages
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#0A2540]">
              Most Popular Kits
            </h2>
            <p className="text-[#6B7A8D] mt-2 max-w-md">
              Faculty-verified packages trusted by thousands of dental students across Egypt.
            </p>
          </div>
          <Link
            href="/packages"
            className="flex items-center gap-1.5 text-sm font-semibold text-[#00B4D8] hover:text-[#0A2540] transition-colors cursor-pointer shrink-0"
          >
            Browse all packages <ArrowRight size={14} />
          </Link>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {packages.map((pkg) => (
            <PackageCard key={pkg.slug} pkg={pkg} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
