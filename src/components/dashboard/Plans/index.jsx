"use client";

import { useState } from "react";
import { Check, Coins, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import PagePanel from "@/components/dashboard/_builder/PagePanel";
import { useDashboardTheme } from "@/lib/dashboard/ThemeProvider";
import { useAuth } from "@/components/auth";
import { createOrder } from "@/lib/api/client/orders";
import { verifyPayment } from "@/lib/api/client/payments";
import { openRazorpayCheckout } from "@/lib/payments/razorpay";
import { cn } from "@/lib/cn";

function formatPrice(value) {
  const amount = Number(value);
  if (Number.isNaN(amount)) return String(value ?? "—");
  return amount.toLocaleString("en-IN", {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

function planTypeLabel(type) {
  const raw = String(type || "").trim();
  if (!raw) return "Plan";
  return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
}

export default function Plans({ plans = [], error }) {
  const { isDark } = useDashboardTheme();
  const { user, refreshUser } = useAuth();
  const [buyingPlanId, setBuyingPlanId] = useState(null);
  const activePlans = plans.filter((plan) => plan.is_active !== false);

  async function handleBuyNow(plan) {
    if (!plan?.id || buyingPlanId != null) return;

    setBuyingPlanId(plan.id);
    try {
      const { order, razorpay } = await createOrder(plan.id);

      openRazorpayCheckout({
        razorpay,
        order,
        prefill: {
          name: [user?.first_name, user?.last_name].filter(Boolean).join(" "),
          email: user?.email || "",
          contact: String(user?.phone || "").replace(/\D/g, ""),
        },
        onSuccess: async (response) => {
          try {
            await verifyPayment(response);
            await refreshUser();
            toast.success("Payment verified successfully.");
          } catch (err) {
            toast.error(err?.message || "Payment verification failed");
          }
        },
        onDismiss() {
          toast.message("Payment cancelled");
        },
      });
    } catch (err) {
      toast.error(err?.message || "Could not start payment");
    } finally {
      setBuyingPlanId(null);
    }
  }

  return (
    <PagePanel
      simple
      wide
      eyebrow="Billing"
      title="Plans & Credits"
      description={
        error
          ? "We couldn’t load plans right now."
          : "Pick a plan to top up credits for new flipbooks."
      }
    >
      {error ? (
        <div
          className={cn(
            "rounded-2xl border px-5 py-8 text-center text-sm",
            isDark
              ? "border-rose-400/30 bg-rose-500/10 text-rose-100"
              : "border-rose-200/80 bg-rose-50/80 text-rose-700"
          )}
        >
          {error}
        </div>
      ) : activePlans.length === 0 ? (
        <div
          className={cn(
            "rounded-2xl border border-dashed px-5 py-10 text-center",
            isDark
              ? "border-white/20 bg-white/8"
              : "border-stone-300 bg-white/50"
          )}
        >
          <p
            className={cn(
              "text-sm font-semibold",
              isDark ? "text-white" : "text-slate-900"
            )}
          >
            No plans available
          </p>
          <p
            className={cn(
              "mt-2 text-sm",
              isDark ? "text-slate-300" : "text-slate-600"
            )}
          >
            Check back soon — new credit packs will show up here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {activePlans.map((plan) => {
            const credits = Number(plan.credit) || 0;
            const days = Number(plan.validity_days) || 0;
            const isBuying = buyingPlanId === plan.id;

            return (
              <article
                key={plan.id ?? plan.name}
                className={cn(
                  "flex flex-col rounded-[1.6rem] border p-5 sm:p-6",
                  isDark
                    ? "border-white/12 bg-[#141b24]/96 shadow-[0_18px_50px_-28px_rgba(0,0,0,0.7)]"
                    : "border-[#e4d9c8]/80 bg-[#fffcf8]/88 shadow-[0_18px_40px_-28px_rgba(120,90,50,0.22)]"
                )}
              >
                <p
                  className={cn(
                    "text-[11px] font-medium tracking-[0.18em] uppercase",
                    isDark ? "text-sky-300" : "text-sky-800/80"
                  )}
                >
                  {planTypeLabel(plan.plan_type)}
                </p>
                <h3
                  className={cn(
                    "mt-2 font-heading text-2xl tracking-tight",
                    isDark ? "text-white" : "text-slate-900"
                  )}
                >
                  {plan.name || "Plan"}
                </h3>

                <div className="mt-5 flex items-end gap-1.5">
                  <span
                    className={cn(
                      "text-sm font-medium",
                      isDark ? "text-slate-400" : "text-slate-500"
                    )}
                  >
                    ₹
                  </span>
                  <span
                    className={cn(
                      "font-heading text-4xl leading-none tracking-tight",
                      isDark ? "text-white" : "text-slate-900"
                    )}
                  >
                    {formatPrice(plan.price)}
                  </span>
                </div>

                <ul className="mt-6 flex flex-1 flex-col gap-2.5">
                  <li
                    className={cn(
                      "flex items-center gap-2.5 text-sm",
                      isDark ? "text-slate-200" : "text-slate-700"
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-7 place-items-center rounded-full",
                        isDark
                          ? "bg-sky-400/15 text-sky-300"
                          : "bg-sky-100 text-sky-700"
                      )}
                    >
                      <Coins className="size-3.5" />
                    </span>
                    {credits} {credits === 1 ? "credit" : "credits"}
                  </li>
                  <li
                    className={cn(
                      "flex items-center gap-2.5 text-sm",
                      isDark ? "text-slate-200" : "text-slate-700"
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-7 place-items-center rounded-full",
                        isDark
                          ? "bg-rose-400/15 text-rose-300"
                          : "bg-rose-100 text-rose-700"
                      )}
                    >
                      <CalendarDays className="size-3.5" />
                    </span>
                    Valid for {days} {days === 1 ? "day" : "days"}
                  </li>
                  {(Array.isArray(plan.features) ? plan.features : []).map(
                    (feature, index) => (
                      <li
                        key={`${plan.id}-feature-${index}`}
                        className={cn(
                          "flex items-start gap-2.5 text-sm leading-6",
                          isDark ? "text-slate-300" : "text-slate-600"
                        )}
                      >
                        <span
                          className={cn(
                            "mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full text-white",
                            isDark ? "bg-sky-500" : "bg-sky-600"
                          )}
                        >
                          <Check className="size-3" strokeWidth={3} />
                        </span>
                        {feature}
                      </li>
                    )
                  )}
                </ul>

                <button
                  type="button"
                  onClick={() => handleBuyNow(plan)}
                  disabled={buyingPlanId != null}
                  className={cn(
                    "mt-6 inline-flex h-10 w-full cursor-pointer items-center justify-center rounded-full px-4 text-sm font-semibold text-white transition hover:brightness-110 active:scale-[0.98] disabled:cursor-wait disabled:opacity-70",
                    "bg-linear-to-r from-sky-500 to-rose-500"
                  )}
                >
                  {isBuying ? "Starting…" : "Buy Now"}
                </button>
              </article>
            );
          })}
        </div>
      )}
    </PagePanel>
  );
}
