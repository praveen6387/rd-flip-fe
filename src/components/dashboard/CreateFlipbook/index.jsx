"use client";

import PagePanel from "@/components/dashboard/_builder/PagePanel";
import { useDashboardTheme } from "@/lib/dashboard/ThemeProvider";
import { cn } from "@/lib/cn";

export default function CreateFlipbook() {
  const { isDark } = useDashboardTheme();

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
            className={cn(
              "rounded-2xl border p-4 transition duration-300 hover:-translate-y-0.5 hover:shadow-md",
              isDark
                ? "border-white/15 bg-white/10 hover:border-rose-400/40 hover:bg-white/14"
                : "border-stone-200/80 bg-white/70 hover:border-rose-300 hover:bg-white"
            )}
            style={{ animationDelay: `${120 + index * 60}ms` }}
          >
            <p
              className={cn(
                "text-[11px] font-medium tracking-[0.16em] uppercase",
                isDark ? "text-sky-300" : "text-sky-700"
              )}
            >
              Step {index + 1}
            </p>
            <p
              className={cn(
                "mt-2 text-sm font-semibold",
                isDark ? "text-white" : "text-slate-900"
              )}
            >
              {step}
            </p>
          </div>
        ))}
      </div>
    </PagePanel>
  );
}
