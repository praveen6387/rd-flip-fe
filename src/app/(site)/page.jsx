import {
  AboutSection,
  ContactSection,
  FeaturesSection,
  GallerySection,
  Home2Section,
  HowItWorksSection,
  PlansSection,
} from "@/components/landing";
import { listPlans } from "@/lib/api/server/plans";

export default async function Home() {
  const { plans } = await listPlans();

  return (
    <main className="flex-1">
      <Home2Section />
      <AboutSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PlansSection plans={plans} />
      <GallerySection />
      <ContactSection />
    </main>
  );
}
