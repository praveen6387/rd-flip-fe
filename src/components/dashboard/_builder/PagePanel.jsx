"use client";

import { cn } from "@/lib/cn";
import { useDashboardTheme } from "@/lib/dashboard/ThemeProvider";

export default function PagePanel({
  eyebrow,
  title,
  description,
  children,
  actions,
}) {
  const { isDark } = useDashboardTheme();

  return (
    <section className="dash-fade-up mx-auto max-w-5xl space-y-5">
      <div
        className={cn(
          "dash-glass-shine relative overflow-hidden rounded-3xl border p-5 backdrop-blur-xl transition-colors duration-300 sm:p-7",
          isDark
            ? "border-white/15 bg-white/10 shadow-[0_18px_50px_-28px_rgba(0,0,0,0.65)]"
            : "border-white/70 bg-white/55 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.35)]"
        )}
      >
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute -top-24 right-0 size-56 rounded-full blur-3xl",
            isDark ? "bg-sky-400/15" : "bg-sky-300/20"
          )}
        />
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute -bottom-28 left-10 size-56 rounded-full blur-3xl",
            isDark ? "bg-rose-400/15" : "bg-rose-300/15"
          )}
        />
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-x-6 top-0 h-px bg-linear-to-r from-transparent to-transparent",
            isDark ? "via-white/40" : "via-white"
          )}
        />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            {eyebrow ? (
              <p
                className={cn(
                  "text-[11px] font-medium tracking-[0.18em] uppercase",
                  isDark ? "text-sky-300" : "text-sky-700"
                )}
              >
                {eyebrow}
              </p>
            ) : null}
            <h2
              className={cn(
                "mt-1 text-2xl font-semibold tracking-tight sm:text-3xl",
                isDark ? "text-white" : "text-slate-900"
              )}
            >
              {title}
            </h2>
            {description ? (
              <p
                className={cn(
                  "mt-2 max-w-2xl text-sm leading-6",
                  isDark ? "text-slate-300" : "text-slate-600"
                )}
              >
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
