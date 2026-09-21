"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/cn";
import MotionCard from "@/components/landing/_builder/MotionCard";

function formatPrice(value) {
  const amount = Number(value);
  if (Number.isNaN(amount)) return String(value ?? "—");
  return amount.toLocaleString("en-IN", {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

function planTag(type) {
  const key = String(type || "").toLowerCase();
  if (key === "studio") return "Your studio";
  if (key === "lab") return "You + other studios";
  return key ? key.charAt(0).toUpperCase() + key.slice(1) : "Plan";
}

export default function Content({ plans = [], isDark = false }) {
  const activePlans = plans.filter((plan) => plan.is_active !== false);

  return (
    <div>
      <div className="max-w-xl">
        <p
          className={cn(
            "text-sm font-medium uppercase tracking-[0.22em] sm:text-base",
            isDark ? "text-violet-300/80" : "text-indigo-600"
          )}
        >
          Plans
        </p>
        <h2
          className={cn(
            "mt-4 font-heading text-4xl leading-tight sm:text-5xl",
            isDark ? "text-white" : "text-slate-900"
          )}
        >
          Studio or Lab
        </h2>
        <p
          className={cn(
            "mt-5 text-lg leading-8 sm:text-xl sm:leading-9",
            isDark ? "text-slate-300" : "text-slate-500"
          )}
        >
          Your studio alone, or create flipbooks for others — choose what fits.
        </p>
      </div>

      <div className="relative mt-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-6 -z-10 rounded-[2rem] bg-[radial-gradient(ellipse_at_20%_40%,rgba(129,140,248,0.35),transparent_55%),radial-gradient(ellipse_at_80%_60%,rgba(244,114,182,0.28),transparent_50%),radial-gradient(ellipse_at_50%_100%,rgba(56,189,248,0.22),transparent_55%)] blur-2xl"
        />
        {activePlans.length === 0 ? (
          <div
            className={cn(
              "rounded-3xl border border-dashed px-6 py-12 text-center shadow-[0_12px_40px_-20px_rgba(79,70,229,0.35)] ring-1 backdrop-blur-2xl sm:px-8",
              isDark
                ? "border-white/20 bg-white/8 ring-white/10"
                : "border-white/70 bg-white/30 ring-white/40"
            )}
          >
            <p
              className={cn(
                "font-heading text-2xl",
                isDark ? "text-white" : "text-slate-900"
              )}
            >
              No active plans found
            </p>
            <p
              className={cn(
                "mt-2 text-sm sm:text-base",
                isDark ? "text-slate-300" : "text-slate-500"
              )}
            >
              New credit packs will show up here soon. Please check back later.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {activePlans.map((plan, index) => {
              const credits = Number(plan.credit) || 0;
              const days = Number(plan.validity_days) || 0;
              const features = Array.isArray(plan.features) ? plan.features : [];

              return (
                <MotionCard
                  key={plan.id ?? plan.name}
                  as="article"
                  index={index}
                  className={cn(
                    "flex flex-col rounded-3xl border p-6 shadow-[0_12px_40px_-20px_rgba(79,70,229,0.35)] ring-1 backdrop-blur-2xl sm:p-8",
                    isDark
                      ? "border-white/15 bg-white/8 ring-white/10"
                      : "border-white/70 bg-white/30 ring-white/40"
                  )}
                >
                  <p className="text-xs font-medium tracking-[0.18em] text-slate-400 uppercase">
                    {planTag(plan.plan_type)}
                  </p>
                  <h3
                    className={cn(
                      "mt-2 font-heading text-3xl sm:text-4xl",
                      isDark ? "text-white" : "text-slate-900"
                    )}
                  >
                    {plan.name || "Plan"}
                  </h3>

                  <div className="mt-5 flex items-end gap-1.5">
                    <span
                      className={cn(
                        "text-sm font-medium",
                        isDark ? "text-slate-300" : "text-slate-500"
                      )}
                    >
                      ₹
                    </span>
                    <span
                      className={cn(
                        "font-heading text-5xl leading-none tracking-tight",
                        isDark ? "text-white" : "text-slate-900"
                      )}
                    >
                      {formatPrice(plan.price)}
                    </span>
                    <span
                      className={cn(
                        "mb-1 text-sm",
                        isDark ? "text-slate-300" : "text-slate-500"
                      )}
                    >
                      / month
                    </span>
                  </div>
                  <p
                    className={cn(
                      "mt-2 text-sm font-medium",
                      isDark ? "text-violet-300" : "text-indigo-600"
                    )}
                  >
                    {credits} {credits === 1 ? "credit" : "credits"} · {days}{" "}
                    {days === 1 ? "day" : "days"}
                  </p>

                  <ul className="mt-6 flex flex-1 flex-col gap-2.5">
                    {features.map((point, featureIndex) => (
                      <li
                        key={`${plan.id}-feature-${featureIndex}`}
                        className={cn(
                          "flex items-start gap-2.5 text-sm leading-6 sm:text-[15px]",
                          isDark ? "text-slate-300" : "text-slate-600"
                        )}
                      >
                        <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-white">
                          <Check className="size-3" strokeWidth={3} />
                        </span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </MotionCard>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
