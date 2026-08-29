import PagePanel from "@/components/dashboard/_builder/PagePanel";

export default function CreateFlipbook() {
  return (
    <PagePanel
      eyebrow="Studio tools"
      title="Create Flipbook"
      description="Spin up a new digital flipbook. The builder steps will plug in here."
    >
      <div className="grid gap-3 sm:grid-cols-3">
        {["Upload pages", "Brand cover", "Share link"].map((step, index) => (
          <div
            key={step}
            className="rounded-2xl border border-stone-200/80 bg-white/70 p-4 transition duration-300 hover:-translate-y-0.5 hover:border-rose-300 hover:bg-white hover:shadow-md"
            style={{ animationDelay: `${120 + index * 60}ms` }}
          >
            <p className="text-[11px] font-medium tracking-[0.16em] text-sky-700 uppercase">
              Step {index + 1}
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-900">{step}</p>
          </div>
        ))}
      </div>
    </PagePanel>
  );
}
