import { backendUrl, ENDPOINTS } from "@/lib/api/endpoints";
import { getAuthHeaders } from "@/lib/api/server/cookies";

function isAuthFailure(response, result) {
  if (response.status === 401) return true;

  const message = `${result?.message ?? ""} ${result?.details ?? result?.detail ?? ""}`.toLowerCase();
  return (
    result?.status === "fail" &&
    (message.includes("token") || message.includes("authentication credentials"))
  );
}

export async function getProfile() {
  const headers = await getAuthHeaders();

  if (!headers) {
    return { user: null, error: null, unauthorized: true };
  }

  const response = await fetch(backendUrl(ENDPOINTS.me), {
    headers,
    cache: "no-store",
  });

  const result = await response.json().catch(() => null);

  if (isAuthFailure(response, result)) {
    return { user: null, error: null, unauthorized: true };
  }

  if (!response.ok || result?.status === "fail") {
    return {
      user: null,
      error: result?.message || "Failed to fetch profile",
      unauthorized: false,
    };
  }

  return { user: result.data?.user ?? null, error: null, unauthorized: false };
}
