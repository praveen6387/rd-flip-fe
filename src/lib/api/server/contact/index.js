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

export async function listAdminContactMessages() {
  const headers = await getAuthHeaders();

  if (!headers) {
    return { messages: [], error: null, unauthorized: true };
  }

  const response = await fetch(backendUrl(ENDPOINTS.adminContact), {
    headers,
    cache: "no-store",
  });
  const result = await response.json().catch(() => null);

  if (isAuthFailure(response, result)) {
    return { messages: [], error: null, unauthorized: true };
  }

  if (response.status === 403) {
    return { messages: [], error: "Admin access required.", unauthorized: false };
  }

  if (!response.ok || result?.status === "fail") {
    return {
      messages: [],
      error: formatFailResult(result, "Failed to fetch contact messages"),
      unauthorized: false,
    };
  }

  return {
    messages: result.data?.messages ?? [],
    error: null,
    unauthorized: false,
  };
}
