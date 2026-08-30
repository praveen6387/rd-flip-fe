import { authenticatedFetch } from "@/lib/api/client/auth";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { formatFailResult } from "@/lib/api/error";

export async function createFlipbook(payload) {
  const response = await authenticatedFetch(ENDPOINTS.flipbooks, {
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
