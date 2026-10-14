import "server-only";
import { backendUrl } from "@/lib/api/endpoints";
import { getAuthHeaders } from "@/lib/api/server/cookies";
import { formatFailResult } from "@/lib/api/error";

export async function listPhotoSelections() {
  const headers = await getAuthHeaders();
  if (!headers) return { albums: [], error: "Please sign in again." };
  try {
    const response = await fetch(backendUrl("/api/photo-selection/"), {
      headers,
      cache: "no-store",
    });
    const result = await response.json().catch(() => null);
    if (!response.ok || result?.status !== "success") {
      return { albums: [], error: response.status === 401 ? "Please sign in again." : formatFailResult(result, "Could not load photo folders.") };
    }
    return { albums: result.data?.albums ?? [], error: null };
  } catch {
    return { albums: [], error: "Could not load photo folders. Please try again." };
  }
}
