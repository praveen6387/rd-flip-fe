import { authenticatedFetch } from "@/lib/api/client/auth";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { formatFailResult } from "@/lib/api/error";

function mapSong(song) {
  return { ...song, id: String(song.id) };
}

export async function fetchSongs(query = "") {
  const term = String(query || "").trim();
  const path = term
    ? `${ENDPOINTS.songs}?q=${encodeURIComponent(term)}`
    : ENDPOINTS.songs;

  const response = await authenticatedFetch(path, {
    method: "GET",
  });
  const result = await response.json().catch(() => null);

  if (!response.ok || result?.status === "fail") {
    throw new Error(formatFailResult(result, "Failed to fetch songs"));
  }

  return (result.data?.songs ?? []).map(mapSong);
}

export async function createSong(file) {
  const form = new FormData();
  form.append("file", file);

  const uploadResponse = await fetch("/songs/upload", {
    method: "POST",
    body: form,
  });
  const uploaded = await uploadResponse.json().catch(() => null);

  if (!uploadResponse.ok || uploaded?.status === "fail" || !uploaded?.data?.audio_url) {
    throw new Error(formatFailResult(uploaded, "Failed to upload song"));
  }

  const response = await authenticatedFetch(ENDPOINTS.songsCreate, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: uploaded.data.name,
      audio_url: uploaded.data.audio_url,
    }),
  });
  const result = await response.json().catch(() => null);

  if (!response.ok || result?.status === "fail") {
    throw new Error(formatFailResult(result, "Failed to add song"));
  }

  const song = result.data?.song;
  if (!song) {
    throw new Error("Failed to add song");
  }

  return mapSong(song);
}
