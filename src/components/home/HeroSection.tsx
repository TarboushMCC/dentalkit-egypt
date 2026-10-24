"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";

const universities = [
  "Cairo University",
  "Ain Shams University",
  "Alexandria University",
  "Future University in Egypt",
  "Misr International University",
  "October 6 University",
  "Badr University",
  "British University in Egypt",
];

const stats = [
  { value: "10+", label: "Universities" },
  { value: "50+", label: "Packages" },
  { value: "500+", label: "Products" },
  { value: "5,000+", label: "Students Served" },
];

export function HeroSection() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState<string[]>([]);
  const [selected, setSelected] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSearch = (val: string) => {
    setSearch(val);
    setSelected("");
    if (val.length > 0) {
      setFiltered(universities.filter((u) => u.toLowerCase().includes(val.toLowerCase())));
      setShowDropdown(true);
    } else {
      setFiltered([]);
      setShowDropdown(false);
    }
  };

  const handleSelect = (uni: string) => {
    setSelected(uni);
    setSearch(uni);
    setShowDropdown(false);
  };

  const handleFind = () => {
    const uni = selected || search;
    if (uni) {
      const slug = uni.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      router.push(`/find-kit?university=${encodeURIComponent(uni)}`);
    }
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-mesh pt-20">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-[#00B4D8]/6 blur-3xl" />
        <div className="absolute bottom-0 -left-32 w-[500px] h-[500px] rounded-full bg-[#0A2540]/4 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[#90E0EF]/5 blur-3xl" />

        {/* Grid pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.015]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#0A2540" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left — Text */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="text-center lg:text-left"
          >
            <motion.div variants={staggerItem} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00B4D8]/10 border border-[#00B4D8]/20 text-[#00B4D8] text-xs font-semibold tracking-wide mb-6">
              <Sparkles size={12} />
              Egypt's #1 Dental Student Marketplace
            </motion.div>

            <motion.h1 variants={staggerItem} className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-[#0A2540] leading-[1.1] mb-6">
              Get the Exact Kit{" "}
              <span className="text-gradient-cyan">Your University</span>{" "}
              Requires
            </motion.h1>

            <motion.p variants={staggerItem} className="text-lg text-[#1A1A2E]/60 leading-relaxed max-w-lg mx-auto lg:mx-0 mb-8">
              Stop guessing what instruments you need. Select your university and academic year — we'll show you the exact required package, curated by your faculty.
            </motion.p>

            {/* Search bar */}
            <motion.div variants={staggerItem} className="relative max-w-md mx-auto lg:mx-0">
              <div className="relative flex items-center bg-white rounded-2xl shadow-lg shadow-[#0A2540]/8 border border-[#E2E8F0] p-1.5 gap-2">
                <div className="flex-1 flex items-center gap-2 px-3">
                  <Search size={16} className="text-[#6B7A8D] shrink-0" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    onFocus={() => search && setShowDropdown(true)}
                    placeholder="Search your university..."
                    className="flex-1 text-sm text-[#1A1A2E] placeholder:text-[#9BAAB8] outline-none bg-transparent py-2"
                  />
                </div>
                <Button
                  onClick={handleFind}
                  className="bg-[#0A2540] hover:bg-[#0D3461] text-white rounded-xl px-5 py-2.5 text-sm font-semibold shrink-0 cursor-pointer"
                >
                  Find My Kit
                  <ArrowRight size={14} className="ml-1.5" />
                </Button>
              </div>

              {/* Dropdown */}
              {showDropdown && filtered.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-[#E2E8F0] overflow-hidden z-20"
                >
                  {filtered.map((uni) => (
                    <button
                      key={uni}
                      onClick={() => handleSelect(uni)}
                      className="w-full text-left px-4 py-2.5 text-sm text-[#1A1A2E] hover:bg-[#F4F6F8] transition-colors cursor-pointer first:rounded-t-xl last:rounded-b-xl"
                    >
                      {uni}
                    </button>
                  ))}
                </motion.div>
              )}
            </motion.div>

            {/* Trust signals */}
            <motion.div variants={staggerItem} className="flex flex-wrap gap-4 mt-6 justify-center lg:justify-start">
              {["University-verified packages", "Official equipment lists", "Fast Cairo delivery"].map((t) => (
                <span key={t} className="flex items-center gap-1.5 text-xs text-[#1A1A2E]/60">
                  <CheckCircle2 size={13} className="text-[#00B4D8]" />
                  {t}
                </span>
              ))}
            </motion.div>
          </motion.div>

          {/* Right — Visual */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="hidden lg:block relative"
          >
            {/* Package card mockup */}
            <div className="relative">
              <div className="bg-white rounded-3xl shadow-2xl shadow-[#0A2540]/12 border border-[#E2E8F0] p-6 max-w-sm ml-auto">
                {/* Card header */}
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <span className="inline-block px-2.5 py-1 rounded-full bg-[#00B4D8]/10 text-[#00B4D8] text-xs font-semibold mb-2">Required Package</span>
                    <h3 className="font-display font-bold text-[#0A2540] text-lg">Second Year Clinical Kit</h3>
                    <p className="text-xs text-[#6B7A8D] mt-1">Cairo University • Year 2</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-[#F4F6F8] flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="3" width="18" height="18" rx="3" fill="#0A2540" opacity="0.1"/>
                      <path d="M12 8v8M8 12h8" stroke="#0A2540" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-2 mb-5">
                  {["Dental Mirror Set (3 pcs)", "Explorer & Probe", "Cotton Pliers", "Wax Knife", "Impression Trays", "+ 7 more items"].map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${i < 5 ? "bg-[#00B4D8]" : "bg-[#E2E8F0]"}`} />
                      <span className={`text-sm ${i < 5 ? "text-[#1A1A2E]" : "text-[#9BAAB8]"}`}>{item}</span>
                    </div>
                  ))}
                </div>

                {/* Pricing */}
                <div className="bg-[#F4F6F8] rounded-xl p-3 mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[#6B7A8D]">Buying individually</span>
                    <span className="text-xs text-[#6B7A8D] line-through">EGP 4,200</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#0A2540]">Package price</span>
                    <span className="text-lg font-bold text-[#0A2540]">EGP 2,850</span>
                  </div>
                  <div className="mt-1.5 px-2 py-0.5 bg-green-50 rounded text-xs text-green-700 font-medium w-fit">
                    Save EGP 1,350 (32%)
                  </div>
                </div>

                <button className="w-full bg-[#0A2540] hover:bg-[#0D3461] text-white rounded-xl py-2.5 text-sm font-semibold transition-colors cursor-pointer">
                  Add to Cart
                </button>
              </div>

              {/* Floating badges */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                className="absolute -top-4 -left-4 bg-white rounded-2xl shadow-lg border border-[#E2E8F0] px-3 py-2 flex items-center gap-2"
              >
                <div className="w-6 h-6 rounded-full bg-[#00B4D8] flex items-center justify-center">
                  <CheckCircle2 size={12} className="text-white" />
                </div>
                <span className="text-xs font-semibold text-[#0A2540]">Faculty Verified</span>
              </motion.div>

              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 0.5 }}
                className="absolute -bottom-3 -right-3 bg-[#0A2540] rounded-2xl shadow-lg px-3 py-2 text-white"
              >
                <p className="text-[10px] text-white/60">Average savings</p>
                <p className="text-sm font-bold">EGP 1,200+</p>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="mt-20 grid grid-cols-2 sm:grid-cols-4 gap-6"
        >
          {stats.map((stat) => (
            <motion.div key={stat.label} variants={staggerItem} className="text-center">
              <p className="font-display text-3xl font-bold text-[#0A2540]">{stat.value}</p>
              <p className="text-sm text-[#6B7A8D] mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
