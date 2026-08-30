import { cookies } from "next/headers";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/api/cookie-names";

export async function getServerAccessToken() {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_COOKIE)?.value ?? null;
}

export async function getServerRefreshToken() {
  const cookieStore = await cookies();
  return cookieStore.get(REFRESH_COOKIE)?.value ?? null;
}

export async function getAuthHeaders() {
  const accessToken = await getServerAccessToken();

  if (!accessToken) return null;

  return {
    Authorization: `Bearer ${accessToken}`,
  };
}
