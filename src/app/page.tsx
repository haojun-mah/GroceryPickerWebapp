import { Metadata } from "next";
import CTA from "@/app/(site)/Cta";
import FAQ from "@/app/(site)/Faq";
import FeaturedTime from "@/app/(site)/FeaturedTime";
import Footer from "@/app/(site)/Footer";
import HeroSection from "@/app/(site)/Hero";
import MakerIntro from "@/app/(site)/MakerIntro";
import Navbar from "@/app/(site)/Navbar";
import PricingSection from "@/app/(site)/pricing";
import TestimonialsPage from "@/app/(site)/Testimonials";
import ProblemSection from "@/app/(site)/ProblemSection";
import HowItWorksSection from "@/app/(site)/HowItWorksSection";

export const metadata: Metadata = {
  title: "GroceryPicker - Smart Grocery Shopping Made Easy",
};

export default function Home() {
  return (
    <div className="bg-background">
      <HeroSection />
      <ProblemSection />
      <HowItWorksSection />
      <Footer/>
    </div>
  );
}
