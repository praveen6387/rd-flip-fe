import {
  AboutSection,
  ContactSection,
  FeaturesSection,
  GallerySection,
  HomeSection,
  HowItWorksSection,
  PlansSection,
} from "@/components/landing";

export default function Home() {
  return (
    <main className="flex-1">
      <HomeSection />
      <AboutSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PlansSection />
      <GallerySection />
      <ContactSection />
    </main>
  );
}
