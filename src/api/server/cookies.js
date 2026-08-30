import { cookies } from "next/headers";

export async function getServerAccessToken() {
  const cookieStore = await cookies();
  return cookieStore.get("dashboard_access_token")?.value ?? null;
}

export async function getAuthHeaders() {
  const accessToken = await getServerAccessToken();

  if (!accessToken) return null;

  return {
    Authorization: `Bearer ${accessToken}`,
  };
}
