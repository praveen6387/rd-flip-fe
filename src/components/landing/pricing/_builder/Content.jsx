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
      <div className="max-w-xl">
        <p className="text-[11px] uppercase tracking-[0.25em] text-white/40">Plans</p>
        <h2 className="mt-3 font-heading text-3xl text-white">Studio or Lab</h2>
        <p className="mt-3 text-sm text-white/50">
          Both plans keep generated links open — no countdown on the client URL.
          Signup still includes 1 free credit for 7 days. A book made only on
          that free credit expires in 30 days if you never recharge.
        </p>
      </div>
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {PLANS.map((plan) => (
          <article
            key={plan.name}
            className={cn(
              "flex flex-col border border-white/10 p-8",
              plan.featured && "border-[#d4af37]/50 bg-[#d4af37]/5",
            )}
          >
            <p className="text-xs uppercase tracking-widest text-white/40">{plan.who}</p>
            <h3 className="mt-2 font-heading text-3xl text-white">{plan.name}</h3>
            <p className="mt-3 text-sm leading-6 text-white/55">{plan.detail}</p>
            <ul className="mt-6 flex flex-1 flex-col gap-2 text-sm text-white/70">
              {plan.points.map((point) => (
                <li key={point}>— {point}</li>
              ))}
            </ul>
            <Button
              className={cn(
                "mt-8 h-10 w-fit rounded-none px-5",
                plan.featured
                  ? "bg-[#d4af37] text-black hover:bg-[#e4c35a]"
                  : "border border-white/25 bg-transparent text-white hover:bg-white/10",
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
