"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { use } from "react";
import { GraduationCap, MapPin, Package, ArrowRight, ChevronLeft, ExternalLink } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { staggerContainer, staggerItem } from "@/lib/motion";

interface AcademicYear {
  id: string;
  name: string;
  slug: string;
  yearNumber: number;
}

interface University {
  id: string;
  name: string;
  nameAr: string | null;
  slug: string;
  location: string | null;
  logo: string | null;
  website: string | null;
  description: string | null;
  academicYears: AcademicYear[];
  _count: { packages: number; studentProfiles: number };
}

interface Package {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice: number | null;
  isRequired: boolean;
  isFeatured: boolean;
  stock: number;
  year: { name: string; slug: string; yearNumber: number };
  _count: { items: number; reviews: number };
}

export default function UniversityDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [university, setUniversity] = useState<University | null>(null);
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/universities")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          const uni = json.data.find((u: University) => u.slug === slug);
          setUniversity(uni ?? null);
        }
      });
  }, [slug]);

  useEffect(() => {
    if (!university) return;
    const yearParam = selectedYear ? `&year=${selectedYear}` : "";
    fetch(`/api/packages?university=${slug}${yearParam}`)
      .then((r) => r.json())
      .then((json) => { if (json.success) setPackages(json.data); })
      .finally(() => setLoading(false));
  }, [university, selectedYear, slug]);

  if (loading && !university) {
    return (
      <div className="min-h-screen pt-24 pb-20 bg-[#FAFAF8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-[#E2E8F0] rounded w-1/3" />
            <div className="h-4 bg-[#E2E8F0] rounded w-1/2" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {[...Array(6)].map((_, i) => <div key={i} className="h-48 bg-[#E2E8F0] rounded-2xl" />)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!university && !loading) {
    return (
      <div className="min-h-screen pt-32 pb-20 text-center">
        <GraduationCap size={48} className="text-[#CBD5E0] mx-auto mb-4" />
        <p className="text-[#9BAAB8] text-lg">University not found</p>
        <Link href="/universities" className="text-[#00B4D8] text-sm mt-2 inline-block">← All universities</Link>
      </div>
    );
  }

  const filteredPackages = selectedYear
    ? packages.filter((p) => p.year?.slug === selectedYear)
    : packages;

  return (
    <div className="min-h-screen bg-[#FAFAF8] pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#9BAAB8] mb-8">
          <Link href="/" className="hover:text-[#0A2540] transition-colors">Home</Link>
          <span>/</span>
          <Link href="/universities" className="hover:text-[#0A2540] transition-colors">Universities</Link>
          <span>/</span>
          <span className="text-[#1A1A2E]">{university?.name}</span>
        </nav>

        {/* University Header */}
        {university && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-white rounded-2xl border border-[#E2E8F0] p-6 mb-8 flex items-start gap-6">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#0A2540] to-[#1A3A60] flex items-center justify-center text-white font-bold text-2xl shrink-0">
              {university.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-display text-2xl font-bold text-[#0A2540]">{university.name}</h1>
              {university.nameAr && <p className="text-[#9BAAB8] text-sm mt-0.5">{university.nameAr}</p>}
              <div className="flex items-center gap-4 mt-2 flex-wrap">
                {university.location && (
                  <span className="flex items-center gap-1 text-xs text-[#6B7A8D]"><MapPin size={11} />{university.location}</span>
                )}
                <span className="flex items-center gap-1 text-xs text-[#6B7A8D]"><Package size={11} />{university._count.packages} packages</span>
              </div>
              {university.description && <p className="text-sm text-[#6B7A8D] mt-2 leading-relaxed">{university.description}</p>}
            </div>
            {university.website && (
              <a href={university.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-[#00B4D8] hover:underline shrink-0">
                Website <ExternalLink size={10} />
              </a>
            )}
          </motion.div>
        )}

        {/* Year filter */}
        {university && university.academicYears.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="flex items-center gap-2 flex-wrap mb-8">
            <button
              onClick={() => setSelectedYear(null)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${!selectedYear ? "bg-[#0A2540] text-white" : "bg-white border border-[#E2E8F0] text-[#6B7A8D] hover:border-[#00B4D8]"}`}
            >
              All Years
            </button>
            {university.academicYears.map((year) => (
              <button
                key={year.id}
                onClick={() => setSelectedYear(year.slug)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${selectedYear === year.slug ? "bg-[#0A2540] text-white" : "bg-white border border-[#E2E8F0] text-[#6B7A8D] hover:border-[#00B4D8]"}`}
              >
                {year.name}
              </button>
            ))}
          </motion.div>
        )}

        {/* Packages grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => <div key={i} className="h-52 bg-white border border-[#E2E8F0] rounded-2xl animate-pulse" />)}
          </div>
        ) : filteredPackages.length === 0 ? (
          <div className="text-center py-20">
            <Package size={40} className="text-[#CBD5E0] mx-auto mb-3" />
            <p className="text-[#9BAAB8]">No packages available{selectedYear ? " for this year" : ""} yet.</p>
          </div>
        ) : (
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPackages.map((pkg) => {
              const savings = pkg.comparePrice ? Number(pkg.comparePrice) - Number(pkg.price) : 0;
              const savingsPct = pkg.comparePrice ? Math.round((savings / Number(pkg.comparePrice)) * 100) : 0;
              return (
                <motion.div key={pkg.id} variants={staggerItem}>
                  <Link href={`/packages/${pkg.slug}`}>
                    <div className="group bg-white rounded-2xl border border-[#E2E8F0] p-5 hover:border-[#00B4D8] hover:shadow-lg transition-all duration-200 cursor-pointer h-full flex flex-col">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex gap-1.5 flex-wrap">
                          {pkg.isRequired && <span className="px-2 py-0.5 rounded-full bg-[#0A2540] text-white text-[10px] font-bold">Required</span>}
                          {pkg.isFeatured && <span className="px-2 py-0.5 rounded-full bg-[#00B4D8] text-white text-[10px] font-bold">Featured</span>}
                        </div>
                        {savingsPct > 0 && (
                          <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Save {savingsPct}%</span>
                        )}
                      </div>

                      <h3 className="font-display font-bold text-[#0A2540] mb-1 group-hover:text-[#00B4D8] transition-colors">{pkg.name}</h3>
                      <p className="text-xs text-[#9BAAB8] mb-4">{pkg.year?.name} • {pkg._count.items} items included</p>

                      <div className="mt-auto">
                        <div className="flex items-end justify-between mb-4">
                          <div>
                            <p className="font-display text-2xl font-bold text-[#0A2540]">{formatPrice(Number(pkg.price))}</p>
                            {pkg.comparePrice && (
                              <p className="text-xs text-[#9BAAB8] line-through">{formatPrice(Number(pkg.comparePrice))}</p>
                            )}
                          </div>
                          {savings > 0 && (
                            <p className="text-sm font-semibold text-green-600">Save {formatPrice(savings)}</p>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-xs text-[#9BAAB8]">
                          <span>{pkg.stock > 0 ? `${pkg.stock} in stock` : "Out of stock"}</span>
                          <span className="flex items-center gap-1 text-[#00B4D8] font-medium group-hover:gap-2 transition-all">
                            View Package <ArrowRight size={12} />
                          </span>
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
  );
}
