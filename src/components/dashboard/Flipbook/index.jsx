"use client";

import Link from "next/link";
import PagePanel from "@/components/dashboard/_builder/PagePanel";
import { useDashboardTheme } from "@/lib/dashboard/ThemeProvider";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/cn";
import FlipbookTable from "./_builder/FlipbookTable";

export default function Flipbook({ flipbooks = [], error }) {
  const { isDark } = useDashboardTheme();
  const count = flipbooks.length;

  return (
    <PagePanel
      simple
      wide
      eyebrow="Library"
      title="Flipbook"
      description={
        error
          ? "We couldn’t load your albums right now."
          : count
            ? `${count} album${count === 1 ? "" : "s"} in your studio.`
            : "Browse and open the flipbooks you’ve published for your studio."
      }
      actions={
        <Link
          href={ROUTES.dashboardCreateFlipbook}
          className="inline-flex h-10 items-center justify-center rounded-full bg-linear-to-r from-sky-500 to-rose-500 px-5 text-sm font-semibold text-white transition hover:brightness-110 active:scale-[0.98]"
        >
          Create new
        </Link>
      }
    >
      {error ? (
        <div
          className={cn(
            "rounded-2xl border px-5 py-8 text-center text-sm",
            isDark
              ? "border-rose-400/30 bg-rose-500/10 text-rose-100"
              : "border-rose-200/80 bg-rose-50/80 text-rose-700"
          )}
        >
          {error}
        </div>
      ) : count === 0 ? (
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
            Create one and it will land here with its cover, date, and page
            count.
          </p>
        </div>
      ) : (
        <FlipbookTable flipbooks={flipbooks} />
      )}
    </PagePanel>
  );
}
