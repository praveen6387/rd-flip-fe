import { ENDPOINTS } from "@/api/endpoints";
import { getAuthHeaders } from "@/api/server/cookies";

export async function getProfile() {
  const headers = await getAuthHeaders();

  if (!headers) {
    return { user: null, error: "Authentication credentials were not provided." };
  }

  const response = await fetch(ENDPOINTS.me, {
    headers,
    cache: "no-store",
  });

  const result = await response.json();

  if (!response.ok || result.status === "fail") {
    return {
      user: null,
      error: result.message || "Failed to fetch profile",
    };
  }

  return { user: result.data?.user ?? null, error: null };
}
