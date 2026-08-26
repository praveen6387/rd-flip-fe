import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

const PLANS = [
  {
    name: "Studio",
    who: "Your books only",
    detail:
      "Create flipbooks for your own studio. Fewer credits than Lab. Share links and QR codes do not expire.",
    points: [
      "Own-studio flipbooks",
      "Front, inside, back uploads",
      "Search by client and date",
      "Preview, link, and QR",
    ],
    featured: false,
  },
  {
    name: "Lab",
    who: "Your studio + others",
    detail:
      "Produce flipbooks for other studios as well as your own. More credits, plus studio name on the book.",
    points: [
      "Books for other studios",
      "Higher credit pack",
      "Studio name on the job",
      "Search by studio name too",
    ],
    featured: true,
  },
];

export default function Content() {
  return (
    <div>
      <div className="max-w-2xl">
        <p className="text-sm font-medium uppercase tracking-[0.22em] text-indigo-600 sm:text-base">
          Plans
        </p>
        <h2 className="mt-4 font-heading text-4xl leading-tight text-slate-900 sm:text-5xl">
          Studio or Lab
        </h2>
        <p className="mt-5 text-lg leading-8 text-slate-600 sm:text-xl sm:leading-9">
          Both plans keep generated links open — no countdown on the client URL.
          Signup still includes 1 free credit for 7 days. A book made only on
          that free credit expires in 30 days if you never recharge.
        </p>
      </div>
      <div className="mt-12 grid gap-5 md:grid-cols-2">
        {PLANS.map((plan) => (
          <article
            key={plan.name}
            className={cn(
              "flex flex-col rounded-2xl border p-8 shadow-sm sm:p-10",
              plan.featured
                ? "border-indigo-200 bg-linear-to-br from-indigo-50 to-sky-50"
                : "border-slate-200 bg-white/80",
            )}
          >
            <p className="text-sm uppercase tracking-widest text-slate-400">{plan.who}</p>
            <h3 className="mt-3 font-heading text-4xl text-slate-900 sm:text-5xl">{plan.name}</h3>
            <p className="mt-4 text-lg leading-8 text-slate-600">{plan.detail}</p>
            <ul className="mt-7 flex flex-1 flex-col gap-3 text-base text-slate-700 sm:text-lg">
              {plan.points.map((point) => (
                <li key={point}>— {point}</li>
              ))}
            </ul>
            <Button
              className={cn(
                "mt-8 h-12 w-fit rounded-full px-6 text-base",
                plan.featured
                  ? "bg-linear-to-r from-indigo-500 to-sky-600 text-white hover:from-indigo-600 hover:to-sky-700"
                  : "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50",
              )}
              variant={plan.featured ? "default" : "outline"}
            >
              Choose {plan.name}
            </Button>
          </article>
        ))}
      </div>
    </div>
  );
}
