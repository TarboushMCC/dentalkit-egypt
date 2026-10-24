"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Star, Quote } from "lucide-react";
import { staggerContainer, staggerItem } from "@/lib/motion";

const testimonials = [
  {
    name: "Nour Ahmed",
    role: "3rd Year Student",
    university: "Cairo University",
    rating: 5,
    text: "I spent weeks trying to figure out what instruments I needed. DentalKit showed me exactly what Cairo University requires for Year 3 and I ordered everything in 5 minutes. Saved me EGP 1,400 too!",
    initials: "NA",
  },
  {
    name: "Omar Hassan",
    role: "2nd Year Student",
    university: "Ain Shams University",
    rating: 5,
    text: "The package arrived in 2 days and everything was exactly what my faculty list required. The quality is great and the packaging was professional. Will definitely use again next year.",
    initials: "OH",
  },
  {
    name: "Sara Mahmoud",
    role: "1st Year Student",
    university: "Alexandria University",
    rating: 5,
    text: "As a new dental student I had no idea what to buy. DentalKit made it so easy — I just selected my university, my year, and boom, there was my complete list. Incredible platform.",
    initials: "SM",
  },
  {
    name: "Ahmed Karim",
    role: "4th Year Student",
    university: "Future University",
    rating: 5,
    text: "I've been recommending DentalKit to all my friends. The prices are much better than buying individually from different shops, and everything is guaranteed to match the faculty requirements.",
    initials: "AK",
  },
  {
    name: "Layla Ibrahim",
    role: "Internship",
    university: "Misr International University",
    rating: 5,
    text: "Even for internship year, DentalKit had exactly the right package. Customer support was excellent when I had a question about one of the instruments. 10/10 would recommend.",
    initials: "LI",
  },
  {
    name: "Youssef Tarek",
    role: "2nd Year Student",
    university: "October 6 University",
    rating: 5,
    text: "The savings calculator is amazing — seeing how much I save versus buying individually made the decision so easy. Got my complete kit for less than half of what my seniors paid at retail.",
    initials: "YT",
  },
];

export function Testimonials() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-24 bg-[#F4F6F8] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="inline-block px-3 py-1.5 rounded-full bg-[#0A2540]/10 text-[#0A2540] text-xs font-semibold tracking-wide mb-4">
            Student Reviews
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#0A2540] mb-4">
            Trusted by Thousands of Dental Students
          </h2>
          <p className="text-[#6B7A8D] leading-relaxed">
            Don't take our word for it — hear from real dental students across Egypt.
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} className="fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="font-semibold text-[#0A2540]">4.9/5</span>
            <span className="text-[#6B7A8D] text-sm">from 1,200+ reviews</span>
          </div>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {testimonials.map((t) => (
            <motion.div key={t.name} variants={staggerItem}>
              <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] hover:border-[#00B4D8]/30 hover:shadow-lg hover:shadow-[#0A2540]/6 transition-all duration-200 h-full flex flex-col">
                <Quote size={28} className="text-[#00B4D8]/30 mb-4 shrink-0" />
                <p className="text-sm text-[#1A1A2E]/70 leading-relaxed flex-1 mb-5">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0A2540] flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#0A2540]">{t.name}</p>
                    <p className="text-xs text-[#9BAAB8]">{t.role} • {t.university}</p>
                  </div>
                  <div className="ml-auto flex">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} size={11} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
