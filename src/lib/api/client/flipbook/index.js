import { authenticatedFetch } from "@/lib/api/client/auth";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { formatFailResult } from "@/lib/api/error";

async function postEngagement(path, fallback) {
  const response = await fetch(path, {
    method: "POST",
    credentials: "include",
  });
  const result = await response.json().catch(() => null);

  if (!response.ok || result?.status === "fail" || !result?.data) {
    throw new Error(formatFailResult(result, fallback));
  }

  return {
    view_count: Number(result.data.view_count) || 0,
    like_count: Number(result.data.like_count) || 0,
    liked: Boolean(result.data.liked),
  };
}

export function recordFlipbookView(flipId) {
  return postEngagement(
    ENDPOINTS.flipbookView(flipId),
    "Could not record view"
  );
}

export function toggleFlipbookLike(flipId) {
  return postEngagement(
    ENDPOINTS.flipbookLike(flipId),
    "Could not update like"
  );
}

export async function createFlipbook(payload) {
  const response = await authenticatedFetch(ENDPOINTS.flipbooksCreate, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json().catch(() => null);

  if (!response.ok || result?.status === "fail") {
    throw new Error(formatFailResult(result, "Failed to create flipbook"));
  }

  return result;
}

export async function deleteFlipbook(id) {
  const response = await authenticatedFetch(ENDPOINTS.flipbooksDelete(id), {
    method: "DELETE",
  });
  const result = await response.json().catch(() => null);

  if (!response.ok || result?.status === "fail") {
    throw new Error(formatFailResult(result, "Failed to delete flipbook"));
  }

  return result;
}
