"use client";

import PagePanel from "@/components/dashboard/_builder/PagePanel";
import { useDashboardTheme } from "@/lib/dashboard/ThemeProvider";
import { cn } from "@/lib/cn";
import ContactTable from "./_builder/ContactTable";

export default function ContactMessages({ messages = [], error }) {
  const { isDark } = useDashboardTheme();
  const count = messages.length;

  return (
    <PagePanel
      simple
      eyebrow="Admin"
      title="Contact Us"
      description={
        error
          ? "We couldn’t load contact messages right now."
          : count
            ? `${count} message${count === 1 ? "" : "s"} from the website form.`
            : "No contact messages yet."
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
            No contact messages yet
          </p>
        </div>
      ) : (
        <ContactTable messages={messages} />
      )}
    </PagePanel>
  );
}
