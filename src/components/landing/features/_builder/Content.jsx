import {
  CreditCard,
  Images,
  LayoutList,
  QrCode,
  Search,
  UserRound,
} from "lucide-react";

const FEATURES = [
  {
    icon: UserRound,
    title: "Profile & socials",
    body: "Credits, expiry, and social links — updated once, used on every new flipbook.",
    tone: "from-indigo-500 to-sky-500",
  },
  {
    icon: CreditCard,
    title: "Free credit → recharge",
    body: "Start with free credit. Recharge to keep creating. Existing books stay visible either way.",
    tone: "from-rose-500 to-pink-500",
  },
  {
    icon: Images,
    title: "Create in one flow",
    body: "Customer & studio details, front / back / middle uploads, rearrange, then create.",
    tone: "from-violet-500 to-purple-500",
  },
  {
    icon: LayoutList,
    title: "Flipbook library",
    body: "Every book in one list. Open anytime — no recharge needed to view.",
    tone: "from-emerald-500 to-teal-500",
  },
  {
    icon: QrCode,
    title: "Preview & QR",
    body: "Preview the book, send a QR to the client. Opens in browser — no app.",
    tone: "from-sky-500 to-indigo-500",
  },
  {
    icon: Search,
    title: "Search & filter",
    body: "Find by studio, client name, or date from what you filled at create.",
    tone: "from-amber-400 to-orange-500",
  },
];

export default function Content() {
  return (
    <div>
      <div className="max-w-xl">
        <p className="text-sm font-medium uppercase tracking-[0.22em] text-indigo-600 sm:text-base">
          Inside the workspace
        </p>
        <h2 className="mt-3 font-heading text-3xl leading-tight text-slate-900 sm:text-4xl">
          Create, share, and manage flipbooks
        </h2>
        <p className="mt-3 text-base text-slate-500 sm:text-lg">
          From profile to QR — the tools you use every day.
        </p>
      </div>

      <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => (
          <article
            key={feature.title}
            className="rounded-2xl border border-white/70 bg-white/70 p-5 shadow-[0_1px_0_rgba(15,23,42,0.04)] backdrop-blur-sm transition duration-300 hover:border-indigo-200/80 hover:bg-white hover:shadow-[0_12px_32px_-16px_rgba(79,70,229,0.28)]"
          >
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br ${feature.tone} text-white shadow-sm`}
              >
                <feature.icon className="size-4" strokeWidth={2.25} />
              </span>
              <h3 className="truncate text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
                {feature.title}
              </h3>
            </div>
            <p className="mt-3 pl-12 text-sm leading-6 text-slate-500 sm:text-[15px] sm:leading-6">
              {feature.body}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
