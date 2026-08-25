const WORK = [
  { title: "Dockside 19", meta: "film · 42 frames", h: "h-52" },
  { title: "Blue kitchen", meta: "home · 18 frames", h: "h-72" },
  { title: "Night market", meta: "street · 31 frames", h: "h-40" },
  { title: "Hill station", meta: "travel · 56 frames", h: "h-64" },
];

export default function Content() {
  return (
    <div>
      <div className="flex items-end justify-between gap-6">
        <h2 className="font-heading text-3xl text-white">Open books</h2>
        <p className="hidden max-w-xs text-right text-xs text-white/40 sm:block">
          Dummy titles. Replace with your own covers later.
        </p>
      </div>
      <div className="mt-10 columns-1 gap-4 sm:columns-2">
        {WORK.map((item) => (
          <article key={item.title} className="mb-4 break-inside-avoid border border-white/10">
            <div className={`${item.h} bg-white/5`} />
            <div className="flex items-baseline justify-between px-4 py-3">
              <h3 className="text-sm text-white">{item.title}</h3>
              <p className="text-[11px] text-white/40">{item.meta}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
