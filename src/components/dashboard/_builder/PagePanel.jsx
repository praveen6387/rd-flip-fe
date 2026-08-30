"use client";

import { cn } from "@/lib/cn";
import { useDashboardTheme } from "@/lib/dashboard/ThemeProvider";

export default function PagePanel({
  eyebrow,
  title,
  description,
  children,
  actions,
  lead,
  simple,
}) {
  const { isDark } = useDashboardTheme();

  return (
    <section className="dash-fade-up mx-auto max-w-5xl">
      <div
        className={cn(
          "relative rounded-[2rem] border p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.45)] backdrop-blur-2xl backdrop-saturate-150 transition-colors duration-300 sm:p-8 lg:p-10",
          isDark
            ? "border-white/18 bg-white/[0.07]"
            : "border-white/60 bg-white/28"
        )}
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2rem]">
          <div
            aria-hidden
            className={cn(
              "absolute -top-28 right-4 size-64 rounded-full blur-3xl",
              isDark ? "bg-sky-400/18" : "bg-sky-300/30"
            )}
          />
          <div
            aria-hidden
            className={cn(
              "absolute -bottom-32 left-0 size-72 rounded-full blur-3xl",
              isDark ? "bg-rose-400/14" : "bg-rose-300/22"
            )}
          />
          <div
            aria-hidden
            className={cn(
              "absolute inset-x-10 top-0 h-px bg-linear-to-r from-transparent to-transparent",
              isDark ? "via-white/45" : "via-white"
            )}
          />
        </div>

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            {eyebrow ? (
              <p
                className={cn(
                  "text-[11px] font-medium tracking-[0.28em] uppercase",
                  isDark ? "text-sky-300" : "text-sky-800/80"
                )}
              >
                {eyebrow}
              </p>
            ) : null}
            <h2
              className={cn(
                "mt-2 leading-[1.15] tracking-tight",
                simple
                  ? "text-2xl font-semibold sm:text-3xl"
                  : "font-heading text-3xl sm:text-4xl lg:text-[2.75rem]",
                isDark ? "text-white" : "text-slate-900"
              )}
            >
              {title}
            </h2>
            {description ? (
              <p
                className={cn(
                  "mt-3 max-w-xl text-sm leading-7",
                  isDark ? "text-slate-300" : "text-slate-600"
                )}
              >
                {description}
              </p>
            ) : null}
          </div>
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </div>

        {lead ? <div className="relative mt-8">{lead}</div> : null}
        {children ? (
          <div className={cn("relative", lead ? "mt-8" : "mt-7")}>{children}</div>
        ) : null}
      </div>
    </section>
  );
}
