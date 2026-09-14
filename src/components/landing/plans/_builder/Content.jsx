import { Check } from "lucide-react";

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

export default function Content({ plans = [] }) {
  const activePlans = plans.filter((plan) => plan.is_active !== false);

  return (
    <div>
      <div className="max-w-xl">
        <p className="text-sm font-medium uppercase tracking-[0.22em] text-indigo-600 sm:text-base">
          Plans
        </p>
        <h2 className="mt-3 font-heading text-3xl leading-tight text-slate-900 sm:text-4xl">
          Studio or Lab
        </h2>
        <p className="mt-3 text-base text-slate-500 sm:text-lg">
          Your studio alone, or create flipbooks for others — choose what fits.
        </p>
      </div>

      <div className="relative mt-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-6 -z-10 rounded-[2rem] bg-[radial-gradient(ellipse_at_20%_40%,rgba(129,140,248,0.35),transparent_55%),radial-gradient(ellipse_at_80%_60%,rgba(244,114,182,0.28),transparent_50%),radial-gradient(ellipse_at_50%_100%,rgba(56,189,248,0.22),transparent_55%)] blur-2xl"
        />
        {activePlans.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/70 bg-white/30 px-6 py-12 text-center shadow-[0_12px_40px_-20px_rgba(79,70,229,0.35)] ring-1 ring-white/40 backdrop-blur-2xl sm:px-8">
            <p className="font-heading text-2xl text-slate-900">
              No active plans found
            </p>
            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              New credit packs will show up here soon. Please check back later.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {activePlans.map((plan) => {
              const credits = Number(plan.credit) || 0;
              const days = Number(plan.validity_days) || 0;
              const features = Array.isArray(plan.features) ? plan.features : [];

              return (
                <article
                  key={plan.id ?? plan.name}
                  className="flex flex-col rounded-3xl border border-white/70 bg-white/30 p-6 shadow-[0_12px_40px_-20px_rgba(79,70,229,0.35)] ring-1 ring-white/40 backdrop-blur-2xl sm:p-8"
                >
                  <p className="text-xs font-medium tracking-[0.18em] text-slate-400 uppercase">
                    {planTag(plan.plan_type)}
                  </p>
                  <h3 className="mt-2 font-heading text-3xl text-slate-900 sm:text-4xl">
                    {plan.name || "Plan"}
                  </h3>

                  <div className="mt-5 flex items-end gap-1.5">
                    <span className="text-sm font-medium text-slate-500">₹</span>
                    <span className="font-heading text-5xl leading-none tracking-tight text-slate-900">
                      {formatPrice(plan.price)}
                    </span>
                    <span className="mb-1 text-sm text-slate-500">/ month</span>
                  </div>
                  <p className="mt-2 text-sm font-medium text-indigo-600">
                    {credits} {credits === 1 ? "credit" : "credits"} · {days}{" "}
                    {days === 1 ? "day" : "days"}
                  </p>

                  <ul className="mt-6 flex flex-1 flex-col gap-2.5">
                    {features.map((point, index) => (
                      <li
                        key={`${plan.id}-feature-${index}`}
                        className="flex items-start gap-2.5 text-sm leading-6 text-slate-600 sm:text-[15px]"
                      >
                        <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-white">
                          <Check className="size-3" strokeWidth={3} />
                        </span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
