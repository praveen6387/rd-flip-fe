import { requireDashboardUser } from "@/lib/api/server/session";
import { listSongs } from "@/lib/api/server/songs";
import { CreateFlipbook } from "@/components/dashboard";
import { ROUTES } from "@/lib/routes";

export const metadata = {
  title: "Create Flipbook | RD Flip",
};

export default async function CreateFlipbookPage() {
  const [{ user, error }, { songs }] = await Promise.all([
    requireDashboardUser(ROUTES.dashboardCreateFlipbook),
    listSongs(),
  ]);

  return <CreateFlipbook user={user} error={error} songs={songs} />;
}
