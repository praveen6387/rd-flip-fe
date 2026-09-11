import { backendUrl, ENDPOINTS } from "@/lib/api/endpoints";
import { getAuthHeaders } from "@/lib/api/server/cookies";
import { formatFailResult } from "@/lib/api/error";

function isAuthFailure(response, result) {
  if (response.status === 401) return true;

  const message = `${result?.message ?? ""} ${result?.details ?? result?.detail ?? ""}`.toLowerCase();
  return (
    result?.status === "fail" &&
    (message.includes("token") || message.includes("authentication credentials"))
  );
}

export async function listFlipbooks() {
  const headers = await getAuthHeaders();

  if (!headers) {
    return { flipbooks: [], error: null, unauthorized: true };
  }

  const response = await fetch(backendUrl(ENDPOINTS.flipbooks), {
    headers,
    cache: "no-store",
  });
  const result = await response.json().catch(() => null);

  if (isAuthFailure(response, result)) {
    return { flipbooks: [], error: null, unauthorized: true };
  }

  if (!response.ok || result?.status === "fail") {
    return {
      flipbooks: [],
      error: formatFailResult(result, "Failed to fetch flipbooks"),
      unauthorized: false,
    };
  }

  return {
    flipbooks: result.data?.flipbooks ?? [],
    error: null,
    unauthorized: false,
  };
}

export async function getPublicFlipbook(flip_id) {
  const response = await fetch(
    backendUrl(`${ENDPOINTS.flipbooks}${encodeURIComponent(flip_id)}/`),
    {
      cache: "force-cache",
      next: { revalidate: 1800, tags: [`flipbook-${flip_id}`] },
    }
  );
  const result = await response.json().catch(() => null);
  const flipbook = result?.data?.flipbook ?? null;

  // Expired flipbooks return HTTP 200 with status "fail" and meta (no pages).
  if (result?.status === "fail" && flipbook) {
    return {
      flipbook,
      error: result?.message || "This flipbook has expired.",
      details: result?.details || "",
      expired: true,
    };
  }

  if (!response.ok || result?.status === "fail" || !flipbook) {
    return {
      flipbook: null,
      error: result?.message || "Flipbook not found.",
      details: result?.details || "",
      expired: false,
    };
  }

  return {
    flipbook,
    error: null,
    details: "",
    expired: false,
  };
}
