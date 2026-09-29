import { Plans } from "@/components/dashboard";
import { listPlans } from "@/lib/api/server/plans";

export const metadata = {
  title: "Plans & Credits | RD Flip",
};

export default async function PlansPage() {
  const { plans, error } = await listPlans();

  return <Plans plans={plans} error={error} />;
}
