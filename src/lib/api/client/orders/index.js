import { authenticatedFetch } from "@/lib/api/client/auth";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { formatFailResult } from "@/lib/api/error";

export async function createOrder(planId) {
  const response = await authenticatedFetch(ENDPOINTS.ordersCreate, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ plan_id: planId }),
  });

  const result = await response.json().catch(() => null);

  if (!response.ok || result?.status === "fail") {
    throw new Error(formatFailResult(result, "Failed to create order"));
  }

  const order = result.data?.order;
  const razorpay = result.data?.razorpay;

  if (!razorpay?.key_id || !razorpay?.order_id) {
    throw new Error("Payment details missing from order response");
  }

  return { order, razorpay, raw: result };
}
