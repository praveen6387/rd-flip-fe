"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDashboardTheme } from "@/lib/dashboard/ThemeProvider";
import { cn } from "@/lib/cn";

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatAmount(value) {
  const amount = Number(value);
  if (Number.isNaN(amount)) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function matchesQuery(order, query) {
  if (!query) return true;
  const haystack = [
    order.order_name,
    order.plan_name,
    order.payment_status,
    order.user_name,
    order.user_email,
    order.user_phone,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

export default function OrdersTable({ orders = [] }) {
  const { isDark } = useDashboardTheme();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return orders.filter((item) => matchesQuery(item, needle));
  }, [orders, query]);

  const cellBorder = isDark ? "border-white/10" : "border-stone-200/80";
  const headClass = cn(
    "border-b px-4 py-3 text-left text-xs font-semibold tracking-[0.14em] uppercase",
    cellBorder,
    isDark
      ? "bg-white/[0.05] text-slate-400"
      : "bg-[#fffcf8]/90 text-slate-500"
  );
  const cellClass = cn("border-b px-4 py-3.5", cellBorder);

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
          placeholder="Search order, user, plan, or status"
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
        <table className="min-w-[980px] w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className={cn(headClass, "border-r")}>Order</th>
              <th className={cn(headClass, "border-r")}>User</th>
              <th className={cn(headClass, "border-r")}>Plan</th>
              <th className={cn(headClass, "border-r")}>Amount</th>
              <th className={cn(headClass, "border-r")}>Status</th>
              <th className={headClass}>Date</th>
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
                  No orders match that search.
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr
                  key={item.id ?? item.order_name}
                  className={cn(
                    "last:[&>td]:border-b-0",
                    isDark ? "hover:bg-white/[0.04]" : "hover:bg-white/50"
                  )}
                >
                  <td className={cn(cellClass, "border-r")}>
                    <p
                      className={cn(
                        "font-medium",
                        isDark ? "text-white" : "text-slate-900"
                      )}
                    >
                      {item.order_name}
                    </p>
                  </td>
                  <td className={cn(cellClass, "border-r")}>
                    <p className={isDark ? "text-white" : "text-slate-900"}>
                      {item.user_name || "—"}
                    </p>
                    <p
                      className={cn(
                        "mt-0.5 text-xs",
                        isDark ? "text-slate-400" : "text-slate-500"
                      )}
                    >
                      {item.user_email || item.user_phone || "—"}
                    </p>
                  </td>
                  <td className={cn(cellClass, "border-r")}>
                    {item.plan_name || "—"}
                  </td>
                  <td className={cn(cellClass, "border-r")}>
                    {formatAmount(item.amount)}
                  </td>
                  <td className={cn(cellClass, "border-r capitalize")}>
                    {item.payment_status || "—"}
                  </td>
                  <td className={cellClass}>{formatDate(item.created_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
