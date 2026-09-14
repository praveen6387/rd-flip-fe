import { ENDPOINTS } from "@/lib/api/endpoints";
import { formatFailResult } from "@/lib/api/error";

export async function createContactMessage(payload) {
  const response = await fetch(ENDPOINTS.contactCreate, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json().catch(() => null);

  if (!response.ok || result?.status === "fail") {
    throw new Error(
      formatFailResult(result, "Could not send your message. Please try again.")
    );
  }

  return result;
}
