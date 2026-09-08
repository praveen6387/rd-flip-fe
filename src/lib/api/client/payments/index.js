import { authenticatedFetch } from "@/lib/api/client/auth";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { formatFailResult } from "@/lib/api/error";

export async function verifyPayment(razorpayResponse) {
  const payload = {
    razorpay_payment_id: razorpayResponse?.razorpay_payment_id,
    razorpay_order_id: razorpayResponse?.razorpay_order_id,
    razorpay_signature: razorpayResponse?.razorpay_signature,
  };

  if (
    !payload.razorpay_payment_id ||
    !payload.razorpay_order_id ||
    !payload.razorpay_signature
  ) {
    throw new Error("Incomplete payment response from Razorpay");
  }

  const response = await authenticatedFetch(ENDPOINTS.paymentsVerify, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json().catch(() => null);

  if (!response.ok || result?.status === "fail") {
    throw new Error(formatFailResult(result, "Payment verification failed"));
  }

  return result;
}
