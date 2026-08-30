import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/api/server/auth";
import { JUST_REFRESHED_COOKIE } from "@/lib/api/cookie-names";
import { ROUTES } from "@/lib/routes";

export async function requireDashboardUser(nextPath = ROUTES.dashboard) {
  const { user, error, unauthorized } = await getProfile();

  if (unauthorized) {
    const cookieStore = await cookies();
    if (cookieStore.get(JUST_REFRESHED_COOKIE)?.value === "1") {
      redirect("/auth/refresh?giveup=1");
    }
    redirect(`/auth/refresh?next=${nextPath}`);
  }

  return { user, error };
}
