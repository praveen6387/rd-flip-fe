const FEATURES = [
  {
    title: "Dashboard tabs",
    body: "After login, move between create, library, search, and share from the side nav.",
    tone: "from-indigo-500 to-sky-500",
  },
  {
    title: "Covers and insides",
    body: "Upload a front cover, a back cover, and the middle images — or fill each section with its own set.",
    tone: "from-rose-500 to-pink-500",
  },
  {
    title: "See and reorder",
    body: "On the create screen you see every image. Drag them into the order you want, then hit create.",
    tone: "from-violet-500 to-purple-500",
  },
  {
    title: "Library + search",
    body: "All books stay in one place. Find them by client name, date, or studio name.",
    tone: "from-emerald-500 to-teal-500",
  },
  {
    title: "Preview, link, QR",
    body: "Open the book yourself, preview as the client will, copy a share link, or generate a QR to send.",
    tone: "from-sky-500 to-indigo-500",
  },
  {
    title: "Studio name on Lab",
    body: "Lab plans can stamp another studio’s name on the flipbook when you produce for them.",
    tone: "from-amber-400 to-orange-500",
  },
];

export default function Content() {
  return (
    <div>
      <div className="max-w-2xl">
        <p className="text-sm font-medium uppercase tracking-[0.22em] text-indigo-600 sm:text-base">
          Inside the app
        </p>
        <h2 className="mt-4 font-heading text-4xl leading-tight text-slate-900 sm:text-5xl">
          What you actually do in RD Flip
        </h2>
      </div>
      <div className="mt-12 grid gap-5 sm:grid-cols-2">
        {FEATURES.map((feature) => (
          <article
            key={feature.title}
            className="rounded-2xl border border-slate-200 bg-white/80 p-8 shadow-sm transition hover:shadow-md"
          >
            <span className={`mb-5 inline-flex size-12 rounded-xl bg-linear-to-br ${feature.tone} shadow-md`} />
            <h3 className="text-xl font-semibold text-slate-900 sm:text-2xl">{feature.title}</h3>
            <p className="mt-3 text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
              {feature.body}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
