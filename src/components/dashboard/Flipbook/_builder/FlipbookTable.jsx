"use client";

import { useMemo, useState } from "react";
import { BookOpen, CalendarDays, Copy, Search } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { useDashboardTheme } from "@/lib/dashboard/ThemeProvider";
import { cn } from "@/lib/cn";

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function matchesQuery(flipbook, query) {
  if (!query) return true;
  const haystack = [
    flipbook.title,
    flipbook.description,
    flipbook.studio_name,
    flipbook.flip_id,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

export default function FlipbookTable({ flipbooks }) {
  const { isDark } = useDashboardTheme();
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return flipbooks.filter((item) => matchesQuery(item, needle));
  }, [flipbooks, query]);

  async function copyId(flipId) {
    try {
      await navigator.clipboard.writeText(flipId);
      toast.success("Flip ID copied");
    } catch {
      toast.error("Could not copy Flip ID");
    }
  }

  const headClass = cn(
    "px-4 py-3 text-left text-[11px] font-medium tracking-[0.16em] uppercase",
    isDark ? "text-slate-400" : "text-slate-500"
  );

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search
          className={cn(
            "pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2",
            isDark ? "text-slate-500" : "text-slate-400"
          )}
        />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search title, studio, or ID"
          className={cn(
            "h-10 rounded-xl border pl-9",
            isDark
              ? "border-white/15 bg-white/[0.06] text-white placeholder:text-slate-500"
              : "border-stone-300/70 bg-white/70 text-slate-900 placeholder:text-slate-400"
          )}
        />
      </div>

      <div
        className={cn(
          "overflow-x-auto rounded-[1.4rem] border",
          isDark ? "border-white/12" : "border-stone-300/55"
        )}
      >
        <table className="min-w-[640px] w-full border-collapse text-sm">
          <thead>
            <tr
              className={cn(
                "border-b",
                isDark ? "border-white/10" : "border-stone-200/80"
              )}
            >
              <th className={headClass}>Album</th>
              <th className={headClass}>Date</th>
              <th className={headClass}>Studio</th>
              <th className={headClass}>ID</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className={cn(
                    "px-4 py-10 text-center",
                    isDark ? "text-slate-400" : "text-slate-500"
                  )}
                >
                  No albums match that search.
                </td>
              </tr>
            ) : (
              filtered.map((item) => {
                const pages = item.total_pages ?? 0;
                return (
                  <tr
                    key={item.id ?? item.flip_id}
                    className={cn(
                      "border-b last:border-b-0",
                      isDark
                        ? "border-white/8 hover:bg-white/[0.04]"
                        : "border-stone-200/70 hover:bg-white/45"
                    )}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "size-14 shrink-0 overflow-hidden rounded-lg bg-black/15",
                            isDark ? "ring-1 ring-white/10" : "ring-1 ring-stone-200"
                          )}
                        >
                          {item.thumbnail ? (
                            <img
                              src={item.thumbnail}
                              alt=""
                              className="size-full object-cover"
                            />
                          ) : (
                            <div
                              className={cn(
                                "grid size-full place-items-center",
                                isDark ? "text-slate-500" : "text-slate-400"
                              )}
                            >
                              <BookOpen className="size-5" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p
                            className={cn(
                              "truncate font-semibold",
                              isDark ? "text-white" : "text-slate-900"
                            )}
                          >
                            {item.title || "Untitled"}
                          </p>
                          <p
                            className={cn(
                              "mt-0.5 truncate text-xs",
                              isDark ? "text-slate-400" : "text-slate-500"
                            )}
                          >
                            {pages} {pages === 1 ? "page" : "pages"}
                            {item.description ? ` · ${item.description}` : ""}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5",
                          isDark ? "text-slate-200" : "text-slate-700"
                        )}
                      >
                        <CalendarDays className="size-3.5 opacity-70" />
                        {formatDate(item.date)}
                      </span>
                    </td>
                    <td
                      className={cn(
                        "px-4 py-3",
                        isDark ? "text-slate-200" : "text-slate-700"
                      )}
                    >
                      {item.studio_name || "—"}
                    </td>
                    <td className="px-4 py-3">
                      {item.flip_id ? (
                        <button
                          type="button"
                          onClick={() => copyId(item.flip_id)}
                          className={cn(
                            "inline-flex items-center gap-1.5 font-mono text-xs",
                            isDark
                              ? "text-slate-300 hover:text-white"
                              : "text-slate-600 hover:text-slate-900"
                          )}
                        >
                          <Copy className="size-3" />
                          {item.flip_id}
                        </button>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
