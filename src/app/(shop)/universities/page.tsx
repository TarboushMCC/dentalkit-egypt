"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { GraduationCap, MapPin, Package, Users, ArrowRight, Search } from "lucide-react";
import { staggerContainer, staggerItem } from "@/lib/motion";

interface University {
  id: string;
  name: string;
  nameAr: string | null;
  slug: string;
  location: string | null;
  logo: string | null;
  website: string | null;
  _count: { packages: number; studentProfiles: number };
  academicYears: { id: string; name: string; slug: string; yearNumber: number }[];
}

export default function UniversitiesPage() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/universities")
      .then((r) => r.json())
      .then((json) => { if (json.success) setUniversities(json.data); })
      .finally(() => setLoading(false));
  }, []);

  const filtered = universities.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    (u.location ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FAFAF8] pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0A2540]/5 text-[#0A2540] text-xs font-semibold mb-4">
            <GraduationCap size={12} /> 10 Universities
          </span>
          <h1 className="font-display text-4xl font-bold text-[#0A2540] mb-3">Choose Your University</h1>
          <p className="text-[#6B7A8D] text-lg max-w-xl mx-auto">
            Select your university to see the exact equipment packages required by your faculty.
          </p>
        </motion.div>

        {/* Search */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="max-w-md mx-auto mb-10">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9BAAB8]" />
            <input
              type="text"
              placeholder="Search universities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:border-[#00B4D8] transition-colors"
            />
          </div>
        </motion.div>

        {/* Grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#E2E8F0] h-52 animate-pulse" />
            ))}
          </div>
        ) : (
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((uni) => (
              <motion.div key={uni.id} variants={staggerItem}>
                <Link href={`/universities/${uni.slug}`}>
                  <div className="group bg-white rounded-2xl border border-[#E2E8F0] p-6 hover:border-[#00B4D8] hover:shadow-lg transition-all duration-200 cursor-pointer h-full flex flex-col">
                    {/* Initials avatar */}
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#0A2540] to-[#1A3A60] flex items-center justify-center text-white font-bold text-lg mb-4 group-hover:from-[#00B4D8] group-hover:to-[#0096C7] transition-all duration-200">
                      {uni.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                    </div>

                    <h2 className="font-display font-bold text-[#0A2540] text-lg mb-1 group-hover:text-[#00B4D8] transition-colors">{uni.name}</h2>
                    {uni.nameAr && <p className="text-sm text-[#9BAAB8] mb-2 font-arabic">{uni.nameAr}</p>}

                    {uni.location && (
                      <div className="flex items-center gap-1.5 text-xs text-[#6B7A8D] mb-4">
                        <MapPin size={11} />
                        {uni.location}
                      </div>
                    )}

                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-[#F4F6F8]">
                      <div className="flex items-center gap-4 text-xs text-[#9BAAB8]">
                        <span className="flex items-center gap-1"><Package size={11} /> {uni._count.packages} packages</span>
                        <span className="flex items-center gap-1"><Users size={11} /> {uni._count.studentProfiles} students</span>
                      </div>
                      <ArrowRight size={14} className="text-[#00B4D8] group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-20">
            <GraduationCap size={40} className="text-[#CBD5E0] mx-auto mb-3" />
            <p className="text-[#9BAAB8]">No universities found for "{search}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
