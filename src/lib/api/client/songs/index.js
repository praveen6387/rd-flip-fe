import { authenticatedFetch } from "@/lib/api/client/auth";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { formatFailResult } from "@/lib/api/error";

const MAX_SONG_BYTES = 10 * 1024 * 1024;

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
  if (!file?.size) {
    throw new Error("Choose an MP3 file.");
  }
  if (file.size > MAX_SONG_BYTES) {
    throw new Error("Song must be 20 MB or smaller.");
  }

  const startResponse = await fetch("/songs/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      filename: file.name,
      size: file.size,
    }),
  });
  const started = await startResponse.json().catch(() => null);
  if (
    !startResponse.ok ||
    started?.status === "fail" ||
    !started?.data?.sessionUri
  ) {
    throw new Error(formatFailResult(started, "Failed to start song upload"));
  }

  const putResponse = await fetch(started.data.sessionUri, {
    method: "PUT",
    headers: { "Content-Type": "audio/mpeg" },
    body: file,
  });
  const driveText = await putResponse.text().catch(() => "");
  let driveFile = null;
  try {
    driveFile = driveText ? JSON.parse(driveText) : null;
  } catch {
    driveFile = null;
  }
  const fileId = driveFile?.id;
  if (!putResponse.ok || !fileId) {
    throw new Error("Could not upload the song to Google Drive.");
  }

  const finishResponse = await fetch("/songs/upload/complete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fileId,
      name: started.data.name,
    }),
  });
  const uploaded = await finishResponse.json().catch(() => null);

  if (
    !finishResponse.ok ||
    uploaded?.status === "fail" ||
    !uploaded?.data?.audio_url
  ) {
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
