"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useDashboardTheme } from "@/lib/dashboard/ThemeProvider";
import { cn } from "@/lib/cn";

const PREVIEW_LENGTH = 140;

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function matchesQuery(message, query) {
  if (!query) return true;
  const haystack = [
    message.id,
    message.name,
    message.email,
    message.phone_number,
    message.message,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

function isLongMessage(value) {
  const text = String(value || "");
  return text.length > PREVIEW_LENGTH || text.split("\n").length > 3;
}

export default function ContactTable({ messages = [] }) {
  const { isDark } = useDashboardTheme();
  const [query, setQuery] = useState("");
  const [openMessage, setOpenMessage] = useState(null);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return messages.filter((item) => matchesQuery(item, needle));
  }, [messages, query]);

  const cellBorder = isDark ? "border-white/10" : "border-stone-200/80";
  const headClass = cn(
    "border-b px-4 py-3 text-left text-xs font-semibold tracking-[0.14em] uppercase",
    cellBorder,
    isDark
      ? "bg-white/[0.05] text-slate-400"
      : "bg-white/50 text-slate-500"
  );
  const cellClass = cn("border-b px-4 py-3.5 align-top", cellBorder);

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
          placeholder="Search name, email, phone, or message"
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
            ? "border-white/12 bg-[#121820]/68 backdrop-blur-2xl"
            : "border-white/70 bg-white/62 shadow-[0_18px_40px_-24px_rgba(80,90,140,0.32)] backdrop-blur-2xl"
        )}
      >
        <table className="min-w-[1100px] w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className={cn(headClass, "border-r")}>ID</th>
              <th className={cn(headClass, "border-r")}>Name</th>
              <th className={cn(headClass, "border-r")}>Email</th>
              <th className={cn(headClass, "border-r")}>Phone</th>
              <th className={cn(headClass, "border-r")}>Message</th>
              <th className={headClass}>Received</th>
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
                  No messages match that search.
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr
                  key={item.id}
                  className={cn(
                    "last:[&>td]:border-b-0",
                    isDark ? "hover:bg-white/[0.04]" : "hover:bg-white/50"
                  )}
                >
                  <td className={cn(cellClass, "border-r")}>{item.id}</td>
                  <td
                    className={cn(
                      cellClass,
                      "border-r font-medium",
                      isDark ? "text-white" : "text-slate-900"
                    )}
                  >
                    {item.name || "—"}
                  </td>
                  <td className={cn(cellClass, "border-r")}>{item.email || "—"}</td>
                  <td className={cn(cellClass, "border-r whitespace-nowrap")}>
                    {item.phone_number || "—"}
                  </td>
                  <td className={cn(cellClass, "border-r max-w-md")}>
                    <p className={cn("line-clamp-3 whitespace-pre-wrap", isDark ? "text-slate-100" : "text-slate-800")}>
                      {item.message || "—"}
                    </p>
                    {isLongMessage(item.message) ? (
                      <button
                        type="button"
                        onClick={() => setOpenMessage(item)}
                        className="mt-1.5 text-xs font-semibold text-sky-600 hover:underline"
                      >
                        View full message
                      </button>
                    ) : null}
                  </td>
                  <td className={cn(cellClass, "whitespace-nowrap")}>
                    {formatDate(item.created_at)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={Boolean(openMessage)} onOpenChange={(next) => { if (!next) setOpenMessage(null); }}>
        <DialogContent
          className={cn(
            "max-h-[min(80vh,720px)] gap-0 overflow-hidden p-0 sm:max-w-lg",
            isDark ? "bg-[#141b24] text-white" : "bg-white text-slate-900"
          )}
        >
          <div className="border-b px-5 py-4 pr-12" style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)" }}>
            <DialogTitle className="text-base font-semibold">
              {openMessage?.name || "Contact message"}
            </DialogTitle>
            <DialogDescription className={cn("mt-1 text-xs", isDark ? "text-slate-400" : "text-slate-500")}>
              {[openMessage?.email, openMessage?.phone_number, formatDate(openMessage?.created_at)].filter(Boolean).join(" · ")}
            </DialogDescription>
          </div>
          <div className="max-h-[60vh] overflow-y-auto px-5 py-4">
            <p className="whitespace-pre-wrap text-sm leading-6">{openMessage?.message || "—"}</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
