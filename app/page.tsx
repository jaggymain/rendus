import FAQs from "@/components/faqs-2";
import Features from "@/components/features-1";
import FooterSection from "@/components/footer";
import HeroSection from "@/components/hero-section";
import IntegrationsSection from "@/components/integrations-2";
import Pricing from "@/components/pricing";
import Image from "next/image";

export default function Home() {
  return <div>
    <HeroSection />
    <IntegrationsSection />
    <Features />
    <Pricing />
    <FAQs />
    <FooterSection />
  </div>
}
