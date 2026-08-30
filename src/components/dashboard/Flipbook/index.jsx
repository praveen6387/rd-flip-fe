"use client";

import Link from "next/link";
import PagePanel from "@/components/dashboard/_builder/PagePanel";
import { useDashboardTheme } from "@/lib/dashboard/ThemeProvider";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/cn";

export default function Flipbook() {
  const { isDark } = useDashboardTheme();

  return (
    <PagePanel
      eyebrow="Library"
      title="Flipbook"
      description="Browse and manage the flipbooks you’ve published for your studio."
      actions={
        <Link
          href={ROUTES.dashboardCreateFlipbook}
          className="inline-flex h-10 items-center justify-center rounded-full bg-linear-to-r from-sky-500 to-rose-500 px-5 text-sm font-semibold text-white transition hover:brightness-110 active:scale-[0.98]"
        >
          Create new
        </Link>
      }
    >
      <div
        className={cn(
          "rounded-2xl border border-dashed px-5 py-10 text-center",
          isDark
            ? "border-white/20 bg-white/8"
            : "border-stone-300 bg-white/50"
        )}
      >
        <p
          className={cn(
            "text-sm font-semibold",
            isDark ? "text-white" : "text-slate-900"
          )}
        >
          No flipbooks yet
        </p>
        <p
          className={cn(
            "mt-2 text-sm",
            isDark ? "text-slate-300" : "text-slate-600"
          )}
        >
          When you create one, it will show up in this glass shelf.
        </p>
      </div>
    </PagePanel>
  );
}
