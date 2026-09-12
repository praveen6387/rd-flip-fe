"use client";

import { useMemo, useState } from "react";
import { BookOpen, CalendarDays, Copy, Eye, QrCode, Search } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import SignedImg from "@/components/dashboard/_builder/SignedImg";
import { useDashboardTheme } from "@/lib/dashboard/ThemeProvider";
import { getFlipbookActiveInfo } from "@/lib/flipbook-active";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/cn";
import FlipbookQrDialog from "./FlipbookQrDialog";
import FlipbookSocialLinks from "./FlipbookSocialLinks";

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
  const [qrFlipbook, setQrFlipbook] = useState(null);
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return flipbooks.filter((item) => matchesQuery(item, needle));
  }, [flipbooks, query]);

  console.log(flipbooks)

  async function copyId(flipId) {
    try {
      await navigator.clipboard.writeText(flipId);
      toast.success("Flip ID copied");
    } catch {
      toast.error("Could not copy Flip ID");
    }
  }

  const cellBorder = isDark ? "border-white/10" : "border-stone-200/80";
  const headClass = cn(
    "border-b px-4 py-3 text-left text-xs font-semibold tracking-[0.14em] uppercase",
    cellBorder,
    isDark
      ? "bg-white/[0.05] text-slate-400"
      : "bg-[#fffcf8]/90 text-slate-500"
  );
  const cellClass = cn("border-b px-4 py-3.5", cellBorder);
  const actionBtn = cn(
    "inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-[13px] font-medium",
    isDark
      ? "border-white/15 text-white hover:bg-white/10"
      : "border-stone-300 text-slate-800 hover:bg-white/80"
  );
  const actionBtnDisabled = cn(
    "inline-flex h-9 cursor-not-allowed items-center gap-1.5 rounded-lg border px-3 text-[13px] font-medium opacity-45",
    isDark ? "border-white/10 text-slate-400" : "border-stone-300 text-slate-500"
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
            "h-11 rounded-xl border pl-9 text-[15px]",
            isDark
              ? "border-white/12 bg-[#1a222d]/90 text-white placeholder:text-slate-500"
              : "border-[#e0d5c4]/90 bg-[#fffcf8]/95 text-slate-900 placeholder:text-slate-400"
          )}
        />
      </div>

      <div
        className={cn(
          "overflow-x-auto rounded-xl border",
          isDark
            ? "border-white/10 bg-[#141b24]/96 shadow-[0_18px_50px_-28px_rgba(0,0,0,0.7)]"
            : "border-[#e4d9c8]/80 bg-[#fffcf8]/90 shadow-[0_18px_40px_-28px_rgba(120,90,50,0.22)]"
        )}
      >
        <table className="min-w-[800px] w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className={cn(headClass, "border-r")}>Album</th>
              <th className={cn(headClass, "border-r")}>Date</th>
              <th className={cn(headClass, "border-r")}>Studio</th>
              <th className={cn(headClass, "border-r")}>Social</th>
              <th className={cn(headClass, "border-r")}>ID</th>
              <th className={headClass}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
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
                const active = getFlipbookActiveInfo(item.active_until);
                return (
                  <tr
                    key={item.id ?? item.flip_id}
                    className={cn(
                      "last:[&>td]:border-b-0",
                      isDark
                        ? "hover:bg-white/[0.04]"
                        : "hover:bg-white/50"
                    )}
                  >
                    <td className={cn(cellClass, "border-r")}>
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "size-14 shrink-0 overflow-hidden rounded-lg bg-black/15",
                            isDark
                              ? "ring-1 ring-white/10"
                              : "ring-1 ring-stone-200"
                          )}
                        >
                          {item.thumbnail ? (
                            <SignedImg
                              src={item.thumbnail}
                              alt=""
                              className="size-full object-cover"
                              fallbackClassName={
                                isDark ? "text-slate-500" : "text-slate-400"
                              }
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
                          {active.hasExpiry ? (
                            <div className="mt-1.5 space-y-0.5">
                              <p
                                className={cn(
                                  "text-xs font-medium",
                                  active.expired
                                    ? isDark
                                      ? "text-rose-300"
                                      : "text-rose-700"
                                    : isDark
                                      ? "text-amber-200/90"
                                      : "text-amber-800"
                                )}
                              >
                                {active.statusLabel}
                              </p>
                              <p
                                className={cn(
                                  "text-[11px] leading-4",
                                  isDark ? "text-slate-400" : "text-slate-500"
                                )}
                              >
                                {active.hint}{" "}
                                <Link
                                  href={ROUTES.dashboardPlans}
                                  className={cn(
                                    "font-semibold underline-offset-2 hover:underline",
                                    isDark ? "text-sky-300" : "text-sky-700"
                                  )}
                                >
                                  Recharge
                                </Link>
                              </p>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className={cn(cellClass, "border-r whitespace-nowrap")}>
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
                        cellClass,
                        "border-r",
                        isDark ? "text-slate-200" : "text-slate-700"
                      )}
                    >
                      {item.studio_name || "—"}
                    </td>
                    <td className={cn(cellClass, "border-r")}>
                      <FlipbookSocialLinks flipbook={item} isDark={isDark} />
                    </td>
                    <td className={cn(cellClass, "border-r")}>
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
                    <td className={cellClass}>
                      {item.flip_id ? (
                        <div className="flex flex-wrap items-center gap-2">
                          {active.expired ? (
                            <>
                              <span
                                className={actionBtnDisabled}
                                title="Recharge to restore View"
                                aria-disabled
                              >
                                <Eye className="size-3.5" />
                                View
                              </span>
                              <span
                                className={actionBtnDisabled}
                                title="Recharge to restore QR"
                                aria-disabled
                              >
                                <QrCode className="size-3.5" />
                                QR
                              </span>
                            </>
                          ) : (
                            <>
                              <Link
                                href={ROUTES.flipbookView(item.flip_id)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={actionBtn}
                              >
                                <Eye className="size-3.5" />
                                View
                              </Link>
                              <button
                                type="button"
                                onClick={() => setQrFlipbook(item)}
                                className={actionBtn}
                              >
                                <QrCode className="size-3.5" />
                                QR
                              </button>
                            </>
                          )}
                        </div>
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

      <FlipbookQrDialog
        flipbook={qrFlipbook}
        open={Boolean(qrFlipbook)}
        onOpenChange={(next) => {
          if (!next) setQrFlipbook(null);
        }}
      />
    </div>
  );
}
