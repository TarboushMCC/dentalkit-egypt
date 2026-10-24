"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, ArrowLeft, CheckCircle2, GraduationCap, Calendar, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { staggerContainer, staggerItem } from "@/lib/motion";

const universities = [
  { name: "Cairo University", slug: "cairo-university", initials: "CU", location: "Cairo", years: 6 },
  { name: "Ain Shams University", slug: "ain-shams-university", initials: "AS", location: "Cairo", years: 6 },
  { name: "Alexandria University", slug: "alexandria-university", initials: "AU", location: "Alexandria", years: 6 },
  { name: "Future University in Egypt", slug: "future-university-egypt", initials: "FU", location: "New Cairo", years: 5 },
  { name: "Misr International University", slug: "misr-international-university", initials: "MIU", location: "6th of October", years: 5 },
  { name: "October 6 University", slug: "october-6-university", initials: "O6U", location: "6th of October", years: 5 },
  { name: "Badr University", slug: "badr-university", initials: "BU", location: "Badr City", years: 5 },
  { name: "British University in Egypt", slug: "british-university-egypt", initials: "BUE", location: "New Cairo", years: 5 },
  { name: "Nahda University", slug: "nahda-university", initials: "NU", location: "Beni Suef", years: 5 },
  { name: "Delta University", slug: "delta-university", initials: "DU", location: "Gamasa", years: 5 },
];

const years = [
  { label: "First Year", value: "year-1", desc: "Preclinical basics & fundamentals" },
  { label: "Second Year", value: "year-2", desc: "Applied preclinical sciences" },
  { label: "Third Year", value: "year-3", desc: "Clinical introduction" },
  { label: "Fourth Year", value: "year-4", desc: "Advanced clinical practice" },
  { label: "Fifth Year", value: "year-5", desc: "Comprehensive clinical training" },
  { label: "Internship", value: "internship", desc: "Pre-graduation practical year" },
];

type Step = 1 | 2;

export default function FindKitPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preSelected = searchParams.get("university");

  const [step, setStep] = useState<Step>(preSelected ? 2 : 1);
  const [selectedUni, setSelectedUni] = useState(preSelected || "");
  const [selectedYear, setSelectedYear] = useState("");
  const [search, setSearch] = useState(preSelected || "");

  const filteredUniversities = search
    ? universities.filter((u) => u.name.toLowerCase().includes(search.toLowerCase()))
    : universities;

  const selectedUniData = universities.find((u) => u.name === selectedUni || u.slug === selectedUni);

  const handleSelectUni = (uni: typeof universities[0]) => {
    setSelectedUni(uni.name);
    setSearch(uni.name);
    setStep(2);
  };

  const handleFind = () => {
    if (!selectedUniData || !selectedYear) return;
    router.push(`/packages?university=${selectedUniData.slug}&year=${selectedYear}`);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] pt-28 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Progress */}
        <div className="flex items-center gap-3 mb-10">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  step >= s
                    ? "bg-[#0A2540] text-white"
                    : "bg-[#E2E8F0] text-[#9BAAB8]"
                }`}
              >
                {step > s ? <CheckCircle2 size={16} /> : s}
              </div>
              <span className={`text-sm font-medium ${step >= s ? "text-[#0A2540]" : "text-[#9BAAB8]"}`}>
                {s === 1 ? "Choose University" : "Select Year"}
              </span>
              {s < 2 && <div className={`h-px w-12 ${step > s ? "bg-[#00B4D8]" : "bg-[#E2E8F0]"}`} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                  <GraduationCap size={20} className="text-[#00B4D8]" />
                  <span className="text-sm font-medium text-[#00B4D8]">Step 1 of 2</span>
                </div>
                <h1 className="font-display text-3xl font-bold text-[#0A2540] mb-2">
                  Which university do you attend?
                </h1>
                <p className="text-[#6B7A8D]">Select your dental faculty to see your required equipment packages.</p>
              </div>

              {/* Search */}
              <div className="relative mb-6">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9BAAB8]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search universities..."
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#E2E8F0] bg-white text-sm text-[#1A1A2E] placeholder:text-[#9BAAB8] outline-none focus:border-[#00B4D8] focus:ring-2 focus:ring-[#00B4D8]/10 transition-all"
                />
              </div>

              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="grid sm:grid-cols-2 gap-3"
              >
                {filteredUniversities.map((uni) => (
                  <motion.button
                    key={uni.slug}
                    variants={staggerItem}
                    onClick={() => handleSelectUni(uni)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                      selectedUni === uni.name
                        ? "border-[#00B4D8] bg-[#00B4D8]/5"
                        : "border-[#E2E8F0] bg-white hover:border-[#00B4D8]/40 hover:bg-[#F4F6F8]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#0A2540] text-white flex items-center justify-center text-xs font-bold shrink-0">
                        {uni.initials}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#0A2540]">{uni.name}</p>
                        <p className="text-xs text-[#9BAAB8]">{uni.location} • {uni.years} years</p>
                      </div>
                      {selectedUni === uni.name && (
                        <CheckCircle2 size={18} className="text-[#00B4D8] ml-auto" />
                      )}
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-8">
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1.5 text-sm text-[#6B7A8D] hover:text-[#0A2540] mb-4 transition-colors cursor-pointer"
                >
                  <ArrowLeft size={14} /> Back to universities
                </button>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar size={20} className="text-[#00B4D8]" />
                  <span className="text-sm font-medium text-[#00B4D8]">Step 2 of 2</span>
                </div>
                <h1 className="font-display text-3xl font-bold text-[#0A2540] mb-1">
                  What year are you in?
                </h1>
                <p className="text-[#6B7A8D]">
                  At <span className="font-semibold text-[#0A2540]">{selectedUniData?.name}</span>
                </p>
              </div>

              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="grid sm:grid-cols-2 gap-3 mb-8"
              >
                {years.map((year) => (
                  <motion.button
                    key={year.value}
                    variants={staggerItem}
                    onClick={() => setSelectedYear(year.value)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                      selectedYear === year.value
                        ? "border-[#00B4D8] bg-[#00B4D8]/5"
                        : "border-[#E2E8F0] bg-white hover:border-[#00B4D8]/40 hover:bg-[#F4F6F8]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-[#0A2540]">{year.label}</p>
                        <p className="text-xs text-[#9BAAB8] mt-0.5">{year.desc}</p>
                      </div>
                      {selectedYear === year.value && (
                        <CheckCircle2 size={18} className="text-[#00B4D8]" />
                      )}
                    </div>
                  </motion.button>
                ))}
              </motion.div>

              <Button
                onClick={handleFind}
                disabled={!selectedYear}
                className="w-full bg-[#0A2540] hover:bg-[#0D3461] text-white py-4 rounded-xl text-base font-semibold flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Show My Required Packages
                <ArrowRight size={18} />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
