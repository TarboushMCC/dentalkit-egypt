"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    q: "How do I know which kit my university requires?",
    a: "Simply select your university and academic year on our platform. We work directly with dental faculty administrations to maintain up-to-date, verified equipment lists for every university and year.",
  },
  {
    q: "Are the packages officially approved by the universities?",
    a: "Yes. All packages are based on official faculty-issued equipment lists. We regularly update our packages in coordination with universities to ensure accuracy.",
  },
  {
    q: "What if I need to buy just one instrument?",
    a: "Absolutely! While we prioritize packages for the best value, all individual instruments are available for purchase in our Products section. This is great for replacements or adding specific tools.",
  },
  {
    q: "How fast is delivery in Egypt?",
    a: "We offer 1-2 day delivery across Greater Cairo and Alexandria. For other governorates, delivery typically takes 3-5 business days. Free shipping on all orders above EGP 500.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept Instapay, credit/debit cards (Visa & Mastercard), and cash on delivery in selected areas. All payments are processed through secure, encrypted channels.",
  },
  {
    q: "Can I return or exchange products?",
    a: "Yes, we offer a 14-day return policy for unused, unopened items in their original packaging. Dental instruments must be in their original sterilized packaging for hygiene reasons.",
  },
  {
    q: "Do you offer packages for all 5 years plus internship?",
    a: "Yes! We cover First Year through Fifth Year, as well as the Internship year, for all supported universities. Package availability depends on the university.",
  },
  {
    q: "How much do I save compared to buying individually?",
    a: "Students typically save between 25-40% compared to purchasing instruments individually from retail stores. Our platform shows the exact savings on every package detail page.",
  },
];

export function FAQSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-3 py-1.5 rounded-full bg-[#00B4D8]/10 text-[#00B4D8] text-xs font-semibold tracking-wide mb-4">
            FAQ
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#0A2540] mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-[#6B7A8D] leading-relaxed">
            Everything you need to know about DentalKit Egypt.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Accordion className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={i}
                className="bg-[#FAFAF8] border border-[#E2E8F0] rounded-xl px-6 data-open:border-[#00B4D8]/40 data-open:bg-white transition-colors"
              >
                <AccordionTrigger className="font-display font-semibold text-[#0A2540] text-sm hover:no-underline py-4 text-left">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-[#6B7A8D] leading-relaxed pb-4">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-12 p-8 bg-[#F4F6F8] rounded-2xl border border-[#E2E8F0]"
        >
          <p className="text-[#6B7A8D] mb-3">Still have questions?</p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 bg-[#0A2540] hover:bg-[#0D3461] text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
          >
            Contact Support
          </a>
        </motion.div>
      </div>
    </section>
  );
}
