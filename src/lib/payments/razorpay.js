/**
 * Opens Razorpay Checkout using backend-created order details.
 * Does not create Razorpay orders on the frontend.
 */
export function openRazorpayCheckout({
  razorpay,
  order,
  prefill = {},
  onSuccess,
  onDismiss,
}) {
  if (typeof window === "undefined") {
    throw new Error("Checkout can only open in the browser");
  }

  if (typeof window.Razorpay !== "function") {
    throw new Error("Razorpay Checkout is still loading. Please try again.");
  }

  const instance = new window.Razorpay({
    key: razorpay.key_id,
    amount: razorpay.amount,
    currency: razorpay.currency || "INR",
    name: "RD Flip",
    description: order?.plan_name
      ? `${order.plan_name} credits`
      : "Plan purchase",
    order_id: razorpay.order_id,
    prefill: {
      name: prefill.name || "",
      email: prefill.email || "",
      contact: prefill.contact || "",
    },
    notes: {
      order_name: order?.order_name || "",
      plan_id: String(order?.plan_id ?? ""),
    },
    theme: {
      color: "#0ea5e9",
    },
    handler(response) {
      onSuccess?.(response, { order, razorpay });
    },
    modal: {
      ondismiss() {
        onDismiss?.();
      },
    },
  });

  instance.open();
  return instance;
}
