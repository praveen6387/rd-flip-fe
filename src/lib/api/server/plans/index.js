import { backendUrl, ENDPOINTS } from "@/lib/api/endpoints";
import { formatFailResult } from "@/lib/api/error";

export async function listPlans() {
  const response = await fetch(backendUrl(ENDPOINTS.plans), {
    cache: "no-store",
  });
  const result = await response.json().catch(() => null);

  if (!response.ok || result?.status === "fail") {
    return {
      plans: [],
      error: formatFailResult(result, "Failed to fetch plans"),
    };
  }

  return {
    plans: result.data?.plans ?? [],
    error: null,
  };
}
