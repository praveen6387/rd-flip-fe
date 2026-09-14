import {
  AboutSection,
  ContactSection,
  FeaturesSection,
  GallerySection,
  HomeSection,
  HowItWorksSection,
  PlansSection,
} from "@/components/landing";
import { listPlans } from "@/lib/api/server/plans";

export default async function Home() {
  const { plans } = await listPlans();
  console.log(plans)

  return (
    <main className="flex-1">
      <HomeSection />
      <AboutSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PlansSection plans={plans} />
      <GallerySection />
      <ContactSection />
    </main>
  );
}
