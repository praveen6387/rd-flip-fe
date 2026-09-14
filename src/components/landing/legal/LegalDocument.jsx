export default function LegalDocument({
  eyebrow,
  title,
  sections,
  error,
  emptyMessage,
}) {
  const items = Array.isArray(sections) ? sections : [];

  return (
    <main className="flex-1 border-b border-slate-200/80">
      <div className="mx-auto w-full max-w-3xl px-6 py-16 sm:py-24">
        <p className="mb-3 text-sm font-medium tracking-[0.22em] text-indigo-600 uppercase">
          {eyebrow}
        </p>
        <h1 className="font-heading text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
          {title}
        </h1>

        {error ? (
          <p className="mt-8 text-base leading-7 text-rose-600">{error}</p>
        ) : null}

        {!error && items.length === 0 ? (
          <p className="mt-8 text-base leading-7 text-slate-500">
            {emptyMessage || "Content will appear here soon."}
          </p>
        ) : null}

        <div className="mt-12 space-y-10">
          {items.map((section, index) => (
            <section key={`${section.heading ?? "section"}-${index}`}>
              {section.heading ? (
                <h2 className="font-heading text-2xl font-semibold tracking-tight text-slate-900">
                  {section.heading}
                </h2>
              ) : null}
              {section.body ? (
                <p className="mt-3 text-base leading-8 text-slate-600 sm:text-lg sm:leading-9">
                  {section.body}
                </p>
              ) : null}
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
