import { Header } from "@/components/header";
import { HeroSection } from "@/components/hero-section";
import { FeaturesSection } from "@/components/features-section";
import { WhyActaSection } from "@/components/why-acta-section";
import { BrandsSection } from "@/components/brands-section";
import { ChromeExtensionSection } from "@/components/chrome-extension-section";
import { MeetingProductivitySection } from "@/components/meeting-productivity-section";
import { AskActaSection } from "@/components/ask-acta-section";
import { MeetingTypesSection } from "@/components/meeting-types-section";
import { TestimonialsSection } from "@/components/testimonials-section";
import { PricingSection } from "@/components/pricing-section";
import { FaqSection } from "@/components/faq-section";
import { SecuritySection } from "@/components/security-section";
import { FinalCtaSection } from "@/components/final-cta-section";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <WhyActaSection />
      <BrandsSection />
      <ChromeExtensionSection />
      <MeetingProductivitySection />
      <AskActaSection />
      <MeetingTypesSection />
      <TestimonialsSection />
      <PricingSection />
      <FaqSection />
      <SecuritySection />
      <FinalCtaSection />
      <Footer />
    </div>
  );
}
