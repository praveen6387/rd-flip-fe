"use client";

import { useMemo, useState } from "react";
import {
  Coins,
  CreditCard,
  Eye,
  Heart,
  MoreHorizontal,
  Receipt,
  Search,
  WalletCards,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDashboardTheme } from "@/lib/dashboard/ThemeProvider";
import { formatCreditExpireDate, isCreditExpired } from "@/lib/credits";
import { cn } from "@/lib/cn";
import UserHistorySheet from "./UserHistorySheet";

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

function formatCount(value) {
  return Number(value || 0).toLocaleString("en-IN");
}

function userName(user) {
  return [user.first_name, user.last_name].filter(Boolean).join(" ") || "—";
}

const HISTORY_ACTIONS = [
  {
    type: "credits",
    label: "Credits",
    hint: "transactions",
    icon: Coins,
    countKey: "credit_transactions",
    iconClass: "bg-sky-500/15 text-sky-300 ring-sky-400/20",
    lightIconClass: "bg-sky-100 text-sky-700 ring-sky-200",
  },
  {
    type: "orders",
    label: "Orders",
    hint: "orders",
    icon: Receipt,
    countKey: "orders",
    iconClass: "bg-rose-500/15 text-rose-300 ring-rose-400/20",
    lightIconClass: "bg-rose-100 text-rose-700 ring-rose-200",
  },
  {
    type: "plans",
    label: "Plans",
    hint: "plans",
    icon: WalletCards,
    countKey: "user_plans",
    iconClass: "bg-violet-500/15 text-violet-300 ring-violet-400/20",
    lightIconClass: "bg-violet-100 text-violet-700 ring-violet-200",
  },
  {
    type: "payments",
    label: "Payments",
    hint: "payments",
    icon: CreditCard,
    countKey: "payments",
    iconClass: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/20",
    lightIconClass: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  },
];

export default function UsersTable({ users = [] }) {
  const { isDark } = useDashboardTheme();
  const [query, setQuery] = useState("");
  const [sheet, setSheet] = useState(null);

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
        <table className="min-w-[1080px] w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className={cn(headClass, "border-r")}>User</th>
              <th className={cn(headClass, "border-r")}>Contact</th>
              <th className={cn(headClass, "border-r")}>Plan</th>
              <th className={cn(headClass, "border-r")}>Role</th>
              <th className={cn(headClass, "border-r")}>Credits</th>
              <th className={cn(headClass, "border-r")}>Activity</th>
              <th className={cn(headClass, "border-r")}>Expires</th>
              <th className={cn(headClass, "w-14 text-right")}> </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
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
                    <td className={cn(cellClass, "border-r whitespace-nowrap")}>
                      <div
                        className={cn(
                          "flex flex-col gap-1 text-xs",
                          isDark ? "text-slate-200" : "text-slate-700"
                        )}
                      >
                        <span className="inline-flex items-center gap-1.5">
                          <Eye className="size-3.5 opacity-70" />
                          {formatCount(item.total_view_count)}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Heart className="size-3.5 opacity-70" />
                          {formatCount(item.total_like_count)}
                        </span>
                      </div>
                    </td>
                    <td className={cn(cellClass, "border-r")}>
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
                    <td className={cn(cellClass, "text-right")}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className={cn(
                              "size-8 rounded-full border shadow-none",
                              isDark
                                ? "border-white/12 bg-white/6 text-slate-200 hover:bg-white/12 hover:text-white"
                                : "border-stone-200 bg-white text-slate-600 hover:bg-stone-50 hover:text-slate-900"
                            )}
                            aria-label={`More actions for ${userName(item)}`}
                          >
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          sideOffset={8}
                          className={cn(
                            "min-w-56 overflow-hidden rounded-2xl border p-1.5 shadow-xl",
                            isDark
                              ? "border-white/12 bg-[#151b22]/98 text-slate-100 backdrop-blur-xl"
                              : "border-[#d9cfc0]/70 bg-[#fbf8f3]/98 text-slate-900 backdrop-blur-xl"
                          )}
                        >
                          <p
                            className={cn(
                              "px-2.5 pb-1.5 pt-1 text-[10px] font-semibold tracking-[0.16em] uppercase",
                              isDark ? "text-slate-500" : "text-slate-400"
                            )}
                          >
                            View details
                          </p>
                          {HISTORY_ACTIONS.map((action) => {
                            const Icon = action.icon;
                            const count = Array.isArray(item[action.countKey])
                              ? item[action.countKey].length
                              : 0;
                            return (
                              <DropdownMenuItem
                                key={action.type}
                                className={cn(
                                  "cursor-pointer gap-2.5 rounded-xl px-2 py-2",
                                  isDark
                                    ? "focus:bg-white/10 focus:text-white"
                                    : "focus:bg-white/80"
                                )}
                                onSelect={() =>
                                  setSheet({ user: item, type: action.type })
                                }
                              >
                                <span
                                  className={cn(
                                    "grid size-8 shrink-0 place-items-center rounded-xl ring-1",
                                    isDark
                                      ? action.iconClass
                                      : action.lightIconClass
                                  )}
                                >
                                  <Icon className="size-3.5" />
                                </span>
                                <span className="min-w-0 flex-1 text-left">
                                  <span className="block text-sm font-medium">
                                    {action.label}
                                  </span>
                                  <span
                                    className={cn(
                                      "block text-[11px]",
                                      isDark ? "text-slate-400" : "text-slate-500"
                                    )}
                                  >
                                    {count} {action.hint}
                                  </span>
                                </span>
                              </DropdownMenuItem>
                            );
                          })}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <UserHistorySheet
        user={sheet?.user}
        sheet={sheet?.type}
        isDark={isDark}
        onClose={() => setSheet(null)}
      />
    </div>
  );
}
