import { backendUrl, ENDPOINTS } from "@/lib/api/endpoints";
import { formatFailResult } from "@/lib/api/error";

export async function getLegalSettings() {
  const response = await fetch(backendUrl(ENDPOINTS.settingsLegal), {
    cache: "no-store",
  });
  const result = await response.json().catch(() => null);

  if (!response.ok || result?.status === "fail") {
    return {
      privacy_policy: [],
      terms_and_conditions: [],
      refund: [],
      error: formatFailResult(result, "Failed to fetch legal settings"),
    };
  }

  return {
    privacy_policy: result.data?.privacy_policy ?? [],
    terms_and_conditions: result.data?.terms_and_conditions ?? [],
    refund: result.data?.refund ?? [],
    error: null,
  };
}
