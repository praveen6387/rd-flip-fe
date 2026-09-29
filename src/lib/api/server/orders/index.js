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

export async function listAdminOrders() {
  const headers = await getAuthHeaders();

  if (!headers) {
    return { orders: [], error: null, unauthorized: true };
  }

  const response = await fetch(backendUrl(ENDPOINTS.adminOrders), {
    headers,
    cache: "no-store",
  });
  const result = await response.json().catch(() => null);

  if (isAuthFailure(response, result)) {
    return { orders: [], error: null, unauthorized: true };
  }

  if (response.status === 403) {
    return { orders: [], error: "Admin access required.", unauthorized: false };
  }

  if (!response.ok || result?.status === "fail") {
    return {
      orders: [],
      error: formatFailResult(result, "Failed to fetch orders"),
      unauthorized: false,
    };
  }

  return {
    orders: result.data?.orders ?? [],
    error: null,
    unauthorized: false,
  };
}
