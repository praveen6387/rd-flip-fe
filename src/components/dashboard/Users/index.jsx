"use client";

import PagePanel from "@/components/dashboard/_builder/PagePanel";
import { useDashboardTheme } from "@/lib/dashboard/ThemeProvider";
import { cn } from "@/lib/cn";
import UsersTable from "./_builder/UsersTable";

export default function Users({ users = [], error }) {
  const { isDark } = useDashboardTheme();
  const count = users.length;

  return (
    <PagePanel
      simple
      eyebrow="Admin"
      title="Users"
      description={
        error
          ? "We couldn’t load users right now."
          : count
            ? `${count} user${count === 1 ? "" : "s"} and their credits.`
            : "No users yet."
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
            No users yet
          </p>
        </div>
      ) : (
        <UsersTable users={users} />
      )}
    </PagePanel>
  );
}
