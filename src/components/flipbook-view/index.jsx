"use client";

import SignedImg from "@/components/dashboard/_builder/SignedImg";

export default function FlipbookView({ flipbook, error }) {
  const pages = [...(flipbook?.pages || [])].sort(
    (a, b) => (a.page_number || 0) - (b.page_number || 0)
  );

  if (error || !flipbook) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-xl items-center justify-center px-6 text-center">
        <div>
          <p className="text-[11px] font-medium tracking-[0.22em] text-sky-800/80 uppercase">
            RD Flip
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
            Flipbook not found
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            {error || "This album is unavailable."}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-dvh max-w-3xl px-4 py-10 sm:px-6">
      <p className="text-[11px] font-medium tracking-[0.22em] text-sky-800/80 uppercase">
        {flipbook.studio_name || "RD Flip"}
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
        {flipbook.title}
      </h1>
      {flipbook.description ? (
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {flipbook.description}
        </p>
      ) : null}

      <ol className="mt-8 space-y-4">
        {pages.map((page) => (
          <li
            key={`${page.page_number}-${page.image_url}`}
            className="overflow-hidden rounded-2xl border border-stone-200 bg-white/70"
          >
            <div className="relative aspect-[4/3] bg-stone-100">
              <SignedImg
                src={page.image_url}
                alt={`Page ${page.page_number}`}
                className="size-full object-cover"
                fallbackClassName="text-slate-400"
              />
            </div>
            <p className="px-3 py-2 text-xs text-slate-500">
              Page {page.page_number}
              {page.cover_type ? ` · ${page.cover_type}` : ""}
            </p>
          </li>
        ))}
      </ol>
    </main>
  );
}
