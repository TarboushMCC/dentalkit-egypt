import { Metadata } from "next";
import { HeroSection } from "@/components/home/HeroSection";
import { HowItWorks } from "@/components/home/HowItWorks";
import { FeaturedUniversities } from "@/components/home/FeaturedUniversities";
import { PopularPackages } from "@/components/home/PopularPackages";
import { Testimonials } from "@/components/home/Testimonials";
import { FAQSection } from "@/components/home/FAQSection";

export const metadata: Metadata = {
  title: "DentalKit Egypt — Find Your University's Required Dental Equipment",
  description:
    "Egypt's #1 marketplace for dental students. Get faculty-verified dental equipment packages for Cairo University, Ain Shams, Alexandria, and 7+ more universities. Save up to 40% vs buying individually.",
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <HowItWorks />
      <FeaturedUniversities />
      <PopularPackages />
      <Testimonials />
      <FAQSection />
    </>
  );
}
