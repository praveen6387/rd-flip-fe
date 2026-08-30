import { getProfile } from "@/lib/api/server/auth";
import { Profile } from "@/components/dashboard";

export const metadata = {
  title: "Profile | RD Flip",
};

export default async function DashboardPage() {
  const { user, error } = await getProfile();

  return <Profile user={user} error={error} />;
}
