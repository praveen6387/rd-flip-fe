import { Check } from "lucide-react";

const PLANS = [
  {
    name: "Studio",
    tag: "Your studio",
    price: "199",
    credits: "20 credits · 1 month",
    points: [
      "Fill customer info at create",
      "Social links from your profile",
      "Flipbook list, preview & QR share",
      "No time limit on created books",
    ],
  },
  {
    name: "Lab",
    tag: "You + other studios",
    price: "299",
    credits: "30 credits · 1 month",
    points: [
      "Everything which is in Studio Version",
      "Set studio name at create",
      "Set social links per flipbook",
      "Create books for other studios",
    ],
  },
];

export default function Content() {
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
        <div className="grid gap-4 md:grid-cols-2">
          {PLANS.map((plan) => (
            <article
              key={plan.name}
              className="flex flex-col rounded-3xl border border-white/70 bg-white/30 p-6 shadow-[0_12px_40px_-20px_rgba(79,70,229,0.35)] ring-1 ring-white/40 backdrop-blur-2xl sm:p-8"
            >
              <p className="text-xs font-medium tracking-[0.18em] text-slate-400 uppercase">
                {plan.tag}
              </p>
              <h3 className="mt-2 font-heading text-3xl text-slate-900 sm:text-4xl">
                {plan.name}
              </h3>

              <div className="mt-5 flex items-end gap-1.5">
                <span className="text-sm font-medium text-slate-500">₹</span>
                <span className="font-heading text-5xl leading-none tracking-tight text-slate-900">
                  {plan.price}
                </span>
                <span className="mb-1 text-sm text-slate-500">/ month</span>
              </div>
              <p className="mt-2 text-sm font-medium text-indigo-600">{plan.credits}</p>

              <ul className="mt-6 flex flex-1 flex-col gap-2.5">
                {plan.points.map((point) => (
                  <li
                    key={point}
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
          ))}
        </div>
      </div>
    </div>
  );
}
