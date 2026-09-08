import { requireDashboardUser } from "@/lib/api/server/session";
import { listPlans } from "@/lib/api/server/plans";
import { Plans } from "@/components/dashboard";
import { ROUTES } from "@/lib/routes";

export const metadata = {
  title: "Plans & Credits | RD Flip",
};

export default async function PlansPage() {
  const { error: sessionError } = await requireDashboardUser(
    ROUTES.dashboardPlans
  );
  const { plans, error } = await listPlans();

  return (
    <Plans
      plans={plans}
      error={sessionError || error}
    />
  );
}
