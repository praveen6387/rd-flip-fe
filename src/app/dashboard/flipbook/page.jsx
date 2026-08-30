import { requireDashboardUser } from "@/lib/api/server/session";
import { listFlipbooks } from "@/lib/api/server/flipbook";
import { Flipbook } from "@/components/dashboard";
import { ROUTES } from "@/lib/routes";

export const metadata = {
  title: "Flipbook | RD Flip",
};

export default async function FlipbookPage() {
  const { error: sessionError } = await requireDashboardUser(
    ROUTES.dashboardFlipbook
  );
  const { flipbooks, error, unauthorized } = await listFlipbooks();

  return (
    <Flipbook
      flipbooks={flipbooks}
      error={
        sessionError ||
        (unauthorized ? "Please sign in again." : error)
      }
    />
  );
}
