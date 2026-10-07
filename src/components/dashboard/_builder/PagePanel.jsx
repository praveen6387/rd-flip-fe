"use client";

import { cn } from "@/lib/cn";
import { useDashboardTheme } from "@/lib/dashboard/ThemeProvider";

export default function PagePanel({
  title,
  description,
  children,
  actions,
  lead,
}) {
  const { isDark } = useDashboardTheme();
  const hasHeader = Boolean(title || description || actions);

  return (
    <section className="dash-fade-up w-full">
      {hasHeader ? (
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            {title ? (
              <h2
                className={cn(
                  "text-2xl font-semibold leading-tight tracking-tight",
                  isDark ? "text-white" : "text-slate-900"
                )}
              >
                {title}
              </h2>
            ) : null}
            {description ? (
              <p
                className={cn(
                  "mt-1 max-w-xl text-sm leading-6",
                  isDark ? "text-slate-300" : "text-slate-600"
                )}
              >
                {description}
              </p>
            ) : null}
          </div>
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </div>
      ) : null}

      {lead ? <div className={cn("relative", hasHeader && "mt-5")}>{lead}</div> : null}
      {children ? (
        <div className={cn("relative", (hasHeader || lead) && (lead ? "mt-5" : "mt-4"))}>
          {children}
        </div>
      ) : null}
    </section>
  );
}
