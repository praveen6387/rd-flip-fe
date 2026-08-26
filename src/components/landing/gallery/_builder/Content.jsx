const WORK = [
  { title: "Dockside 19", meta: "film · 42 frames", h: "h-52", tone: "from-indigo-100 to-sky-100" },
  { title: "Blue kitchen", meta: "home · 18 frames", h: "h-72", tone: "from-rose-100 to-pink-100" },
  { title: "Night market", meta: "street · 31 frames", h: "h-40", tone: "from-violet-100 to-purple-100" },
  { title: "Hill station", meta: "travel · 56 frames", h: "h-64", tone: "from-emerald-100 to-teal-100" },
];

export default function Content() {
  return (
    <div>
      <div className="flex items-end justify-between gap-6">
        <h2 className="font-heading text-4xl text-slate-900 sm:text-5xl">Open books</h2>
        <p className="hidden max-w-xs text-right text-base text-slate-400 sm:block">
          Dummy titles. Replace with your own covers later.
        </p>
      </div>
      <div className="mt-12 columns-1 gap-5 sm:columns-2">
        {WORK.map((item) => (
          <article
            key={item.title}
            className="mb-5 break-inside-avoid overflow-hidden rounded-2xl border border-slate-200 bg-white/80 shadow-sm"
          >
            <div className={`${item.h} bg-linear-to-br ${item.tone}`} />
            <div className="flex items-baseline justify-between px-5 py-4">
              <h3 className="text-lg font-medium text-slate-900">{item.title}</h3>
              <p className="text-sm text-slate-400">{item.meta}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
