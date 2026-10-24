"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { GraduationCap, Calendar, Package, ArrowRight } from "lucide-react";
import { staggerContainer, staggerItem } from "@/lib/motion";

const steps = [
  {
    step: "01",
    icon: GraduationCap,
    title: "Choose Your University",
    description:
      "Select from 10+ Egyptian dental universities. Our platform supports every major faculty of dentistry across Egypt.",
    color: "#0A2540",
    bg: "#E8F0F8",
  },
  {
    step: "02",
    icon: Calendar,
    title: "Select Your Academic Year",
    description:
      "From First Year through Internship, choose your current year and we'll show only what's relevant to you.",
    color: "#00B4D8",
    bg: "#E0F7FC",
  },
  {
    step: "03",
    icon: Package,
    title: "Purchase Your Required Kit",
    description:
      "Get the faculty-verified package at the best price, bundled together and delivered to your door.",
    color: "#0A2540",
    bg: "#E8F0F8",
  },
];

export function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="inline-block px-3 py-1.5 rounded-full bg-[#00B4D8]/10 text-[#00B4D8] text-xs font-semibold tracking-wide mb-4">
            Simple 3-Step Process
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#0A2540] mb-4">
            How DentalKit Works
          </h2>
          <p className="text-[#6B7A8D] leading-relaxed">
            We've made it incredibly simple to find exactly what you need. No more browsing hundreds of products — just three steps to your complete kit.
          </p>
        </motion.div>

        {/* Steps */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid md:grid-cols-3 gap-8 relative"
        >
          {/* Connector line */}
          <div className="hidden md:block absolute top-12 left-1/3 right-1/3 h-px bg-gradient-to-r from-[#00B4D8]/20 via-[#00B4D8] to-[#00B4D8]/20 z-0" />

          {steps.map((step, i) => (
            <motion.div key={step.step} variants={staggerItem} className="relative z-10">
              <div className="bg-[#FAFAF8] rounded-2xl p-8 border border-[#E2E8F0] hover:border-[#00B4D8]/30 hover:shadow-lg hover:shadow-[#0A2540]/6 transition-all duration-300 group">
                {/* Step number */}
                <div className="flex items-center justify-between mb-6">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                    style={{ background: step.bg }}
                  >
                    <step.icon size={22} style={{ color: step.color }} />
                  </div>
                  <span className="font-display text-4xl font-bold text-[#E2E8F0]">{step.step}</span>
                </div>

                <h3 className="font-display text-xl font-bold text-[#0A2540] mb-3">{step.title}</h3>
                <p className="text-sm text-[#6B7A8D] leading-relaxed">{step.description}</p>

                {i < steps.length - 1 && (
                  <div className="md:hidden mt-6 flex justify-center">
                    <ArrowRight size={20} className="text-[#00B4D8]" />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center mt-12"
        >
          <a
            href="/find-kit"
            className="inline-flex items-center gap-2 bg-[#0A2540] hover:bg-[#0D3461] text-white px-8 py-3.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
          >
            Find My Required Kit
            <ArrowRight size={16} />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
