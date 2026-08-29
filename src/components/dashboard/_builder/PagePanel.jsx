export default function PagePanel({
  eyebrow,
  title,
  description,
  children,
  actions,
}) {
  return (
    <section className="dash-fade-up mx-auto max-w-5xl space-y-5">
      <div className="dash-glass-shine relative overflow-hidden rounded-3xl border border-white/70 bg-white/55 p-5 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.35)] backdrop-blur-xl sm:p-7">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 right-0 size-56 rounded-full bg-sky-300/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-28 left-10 size-56 rounded-full bg-rose-300/15 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-6 top-0 h-px bg-linear-to-r from-transparent via-white to-transparent"
        />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            {eyebrow ? (
              <p className="text-[11px] font-medium tracking-[0.18em] text-sky-700 uppercase">
                {eyebrow}
              </p>
            ) : null}
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              {title}
            </h2>
            {description ? (
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                {description}
              </p>
            ) : null}
          </div>
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </div>

        {children ? <div className="relative mt-6">{children}</div> : null}
      </div>
    </section>
  );
}
