import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/api/server/auth";
import { JUST_REFRESHED_COOKIE } from "@/lib/api/cookie-names";
import { Profile } from "@/components/dashboard";
import { ROUTES } from "@/lib/routes";

export const metadata = {
  title: "Profile | RD Flip",
};

export default async function DashboardPage() {
  const { user, error, unauthorized } = await getProfile();

  if (unauthorized) {
    const cookieStore = await cookies();
    if (cookieStore.get(JUST_REFRESHED_COOKIE)?.value === "1") {
      redirect("/auth/refresh?giveup=1");
    }
    redirect(`/auth/refresh?next=${ROUTES.dashboard}`);
  }

  return <Profile user={user} error={error} />;
}
