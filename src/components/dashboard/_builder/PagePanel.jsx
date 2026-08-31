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
    <section className="dash-fade-up w-full">
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
    </section>
  );
}
