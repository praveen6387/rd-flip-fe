"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDashboardTheme } from "@/lib/dashboard/ThemeProvider";
import { formatCreditExpireDate, isCreditExpired } from "@/lib/credits";
import { cn } from "@/lib/cn";

function matchesQuery(user, query) {
  if (!query) return true;
  const haystack = [
    user.first_name,
    user.last_name,
    user.email,
    user.phone,
    user.studio_name,
    user.plan,
    user.role,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

function userName(user) {
  return [user.first_name, user.last_name].filter(Boolean).join(" ") || "—";
}

export default function UsersTable({ users = [] }) {
  const { isDark } = useDashboardTheme();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return users.filter((item) => matchesQuery(item, needle));
  }, [users, query]);

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
          placeholder="Search name, email, phone, or studio"
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
              <th className={cn(headClass, "border-r")}>User</th>
              <th className={cn(headClass, "border-r")}>Contact</th>
              <th className={cn(headClass, "border-r")}>Plan</th>
              <th className={cn(headClass, "border-r")}>Role</th>
              <th className={cn(headClass, "border-r")}>Credits</th>
              <th className={headClass}>Expires</th>
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
                  No users match that search.
                </td>
              </tr>
            ) : (
              filtered.map((item) => {
                const expireLabel = formatCreditExpireDate(item.credit_expire_date);
                const expired = isCreditExpired(item.credit_expire_date);
                return (
                  <tr
                    key={item.user_id}
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
                        {userName(item)}
                      </p>
                      <p
                        className={cn(
                          "mt-0.5 text-xs",
                          isDark ? "text-slate-400" : "text-slate-500"
                        )}
                      >
                        {item.studio_name || "—"}
                      </p>
                    </td>
                    <td className={cn(cellClass, "border-r")}>
                      <p className={isDark ? "text-slate-200" : "text-slate-800"}>
                        {item.email || "—"}
                      </p>
                      <p
                        className={cn(
                          "mt-0.5 text-xs",
                          isDark ? "text-slate-400" : "text-slate-500"
                        )}
                      >
                        {item.phone || "—"}
                      </p>
                    </td>
                    <td className={cn(cellClass, "border-r capitalize")}>
                      {item.plan || "—"}
                    </td>
                    <td className={cn(cellClass, "border-r capitalize")}>
                      {item.role || "—"}
                    </td>
                    <td className={cn(cellClass, "border-r")}>
                      <p className={isDark ? "text-white" : "text-slate-900"}>
                        {item.left_credit ?? 0} left
                      </p>
                      <p
                        className={cn(
                          "mt-0.5 text-xs",
                          isDark ? "text-slate-400" : "text-slate-500"
                        )}
                      >
                        {item.used_credit ?? 0} used · {item.total_credit ?? 0}{" "}
                        total
                      </p>
                    </td>
                    <td className={cellClass}>
                      <span
                        className={cn(
                          expired
                            ? isDark
                              ? "text-rose-300"
                              : "text-rose-700"
                            : isDark
                              ? "text-slate-200"
                              : "text-slate-800"
                        )}
                      >
                        {expireLabel || "—"}
                      </span>
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
