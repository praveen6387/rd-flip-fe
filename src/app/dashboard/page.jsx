import { requireDashboardUser } from "@/lib/api/server/session";
import { Profile } from "@/components/dashboard";
import { ROUTES } from "@/lib/routes";

export const metadata = {
  title: "Profile | RD Flip",
};

export default async function DashboardPage() {
  const { user, error } = await requireDashboardUser(ROUTES.dashboard);

  return <Profile user={user} error={error} />;
}
