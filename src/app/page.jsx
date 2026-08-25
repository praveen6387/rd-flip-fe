import {
  AboutSection,
  ContactSection,
  FeaturesSection,
  GallerySection,
  HomeSection,
  HowItWorksSection,
  PricingSection,
} from "@/components/landing";

export default function Home() {
  return (
    <main className="flex-1">
      <HomeSection />
      <AboutSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
      <GallerySection />
      <ContactSection />
    </main>
  );
}
