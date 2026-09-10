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
                "text-xs font-semibold tracking-[0.22em] uppercase",
                isDark ? "text-sky-300" : "text-sky-700"
              )}
            >
              {eyebrow}
            </p>
          ) : null}
          <h2
            className={cn(
              "mt-2.5 leading-[1.12] tracking-tight",
              simple
                ? "text-3xl font-semibold sm:text-[2.1rem]"
                : "font-heading text-[2rem] sm:text-4xl lg:text-[2.85rem]",
              isDark ? "text-white" : "text-slate-900"
            )}
          >
            {title}
          </h2>
          {description ? (
            <p
              className={cn(
                "mt-3.5 max-w-xl text-[15px] leading-7",
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
