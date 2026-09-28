import { backendUrl, ENDPOINTS } from "@/lib/api/endpoints";
import { getAuthHeaders } from "@/lib/api/server/cookies";
import { formatFailResult } from "@/lib/api/error";

export async function listSongs(query = "") {
  const headers = await getAuthHeaders();

  if (!headers) {
    return { songs: [], error: null, unauthorized: true };
  }

  const term = String(query || "").trim();
  const path = term
    ? `${ENDPOINTS.songs}?q=${encodeURIComponent(term)}`
    : ENDPOINTS.songs;

  const response = await fetch(backendUrl(path), {
    headers,
    cache: "no-store",
  });
  const result = await response.json().catch(() => null);

  if (response.status === 401) {
    return { songs: [], error: null, unauthorized: true };
  }

  if (!response.ok || result?.status === "fail") {
    return {
      songs: [],
      error: formatFailResult(result, "Failed to fetch songs"),
      unauthorized: false,
    };
  }

  return {
    songs: (result.data?.songs ?? []).map((song) => ({
      ...song,
      id: String(song.id),
    })),
    error: null,
    unauthorized: false,
  };
}
