/**
 * @fileoverview Home page component displaying main landing page sections
 * @author Offer Hub Team
 */

import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import HeroSection from "@/components/home/hero-section";
import CategoriesSection from "@/components/home/categories-section";
import FreelancersSection from "@/components/home/freelancers-section";
import HowItWorksSection from "@/components/home/how-it-works-section";
import TestimonialsSection from "@/components/home/testimonials-section";
import CTASection from "@/components/home/cta-section";
import WaitlistSection from "@/components/home/waitlist-section";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header />
      <main>
        <HeroSection />
        <CategoriesSection />
        <FreelancersSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <CTASection />
        <WaitlistSection />
      </main>
      <Footer />
    </div>
  );
}
