"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { staggerContainer, staggerItem } from "@/lib/motion";

const universities = [
  { name: "Cairo University", location: "Cairo", packages: 12, slug: "cairo-university", initials: "CU", color: "#0A2540" },
  { name: "Ain Shams University", location: "Cairo", packages: 10, slug: "ain-shams-university", initials: "AS", color: "#00B4D8" },
  { name: "Alexandria University", location: "Alexandria", packages: 8, slug: "alexandria-university", initials: "AU", color: "#0A2540" },
  { name: "Future University", location: "New Cairo", packages: 9, slug: "future-university-egypt", initials: "FU", color: "#00B4D8" },
  { name: "Misr International", location: "6th of October", packages: 7, slug: "misr-international-university", initials: "MIU", color: "#0A2540" },
  { name: "October 6 University", location: "6th of October", packages: 6, slug: "october-6-university", initials: "O6U", color: "#00B4D8" },
  { name: "British University", location: "New Cairo", packages: 8, slug: "british-university-egypt", initials: "BUE", color: "#0A2540" },
  { name: "Badr University", location: "Badr City", packages: 5, slug: "badr-university", initials: "BU", color: "#00B4D8" },
];

export function FeaturedUniversities() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-24 bg-[#F4F6F8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-4"
        >
          <div>
            <span className="inline-block px-3 py-1.5 rounded-full bg-[#0A2540]/10 text-[#0A2540] text-xs font-semibold tracking-wide mb-3">
              Supported Universities
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#0A2540]">
              Find Your University
            </h2>
            <p className="text-[#6B7A8D] mt-2 max-w-md">
              We partner with Egypt's top dental faculties to provide verified, up-to-date equipment lists.
            </p>
          </div>
          <Link
            href="/universities"
            className="flex items-center gap-1.5 text-sm font-semibold text-[#00B4D8] hover:text-[#0A2540] transition-colors cursor-pointer shrink-0"
          >
            View all universities <ArrowRight size={14} />
          </Link>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          {universities.map((uni) => (
            <motion.div key={uni.slug} variants={staggerItem}>
              <Link href={`/universities/${uni.slug}`} className="group block">
                <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] hover:border-[#00B4D8]/40 hover:shadow-lg hover:shadow-[#0A2540]/6 transition-all duration-200 cursor-pointer h-full">
                  {/* Logo placeholder */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-display font-bold text-sm mb-4 group-hover:scale-105 transition-transform duration-200"
                    style={{ background: uni.color }}
                  >
                    {uni.initials}
                  </div>

                  <h3 className="font-display font-semibold text-[#0A2540] text-sm leading-tight mb-1 group-hover:text-[#00B4D8] transition-colors">
                    {uni.name}
                  </h3>

                  <div className="flex items-center gap-1 text-xs text-[#9BAAB8] mb-3">
                    <MapPin size={10} />
                    {uni.location}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#6B7A8D]">{uni.packages} packages</span>
                    <ArrowRight size={13} className="text-[#C8D4DE] group-hover:text-[#00B4D8] group-hover:translate-x-0.5 transition-all duration-150" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
