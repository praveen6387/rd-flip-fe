import { requireDashboardUser } from "@/lib/api/server/session";
import { CreateFlipbook } from "@/components/dashboard";
import { ROUTES } from "@/lib/routes";

export const metadata = {
  title: "Create Flipbook | RD Flip",
};

export default async function CreateFlipbookPage() {
  const { user, error } = await requireDashboardUser(
    ROUTES.dashboardCreateFlipbook
  );

  return <CreateFlipbook user={user} error={error} />;
}
