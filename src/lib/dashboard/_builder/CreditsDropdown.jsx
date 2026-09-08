"use client";

import Link from "next/link";
import { CalendarDays, ChevronRight, Coins, Sparkles } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/cn";
import {
  formatCreditExpireDate,
  getLeftCredit,
  hasUsableCredit,
  isCreditExpired,
} from "@/lib/credits";

export default function CreditsDropdown({ user, isDark }) {
  if (user?.left_credit == null) return null;

  const left = getLeftCredit(user);
  const expired = isCreditExpired(user.credit_expire_date);
  const usable = hasUsableCredit(user);
  const expireLabel = formatCreditExpireDate(user.credit_expire_date);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs font-medium backdrop-blur-md transition sm:px-3",
            usable
              ? isDark
                ? "border-sky-400/25 bg-sky-400/10 text-sky-200 hover:bg-sky-400/15"
                : "border-sky-300/70 bg-sky-50/80 text-sky-900 hover:bg-sky-100"
              : isDark
                ? "border-rose-400/30 bg-rose-400/10 text-rose-200 hover:bg-rose-400/15"
                : "border-rose-300/70 bg-rose-50/80 text-rose-900 hover:bg-rose-100"
          )}
          title={
            usable
              ? "Credits left for new flipbooks"
              : expired
                ? "Credits expired"
                : "No credits left"
          }
        >
          <Sparkles className="size-3.5 shrink-0 opacity-80" />
          <span className="whitespace-nowrap">
            {expired
              ? "Credits expired"
              : `${left} ${left === 1 ? "credit" : "credits"} left`}
          </span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className={cn(
          "w-[18.5rem] overflow-hidden rounded-2xl border p-0 shadow-[0_20px_50px_-24px_rgba(15,23,42,0.45)]",
          isDark
            ? "border-white/12 bg-[#151b22]/98 text-slate-100 backdrop-blur-xl"
            : "border-[#d9cfc0]/70 bg-[#fbf8f3]/98 text-slate-900 backdrop-blur-xl"
        )}
      >
        <div
          className={cn(
            "relative overflow-hidden px-4 pt-4 pb-3",
            isDark
              ? "bg-linear-to-br from-sky-500/15 via-transparent to-rose-500/10"
              : "bg-linear-to-br from-sky-100/80 via-white/40 to-rose-100/50"
          )}
        >
          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute -top-8 -right-6 size-24 rounded-full blur-2xl",
              isDark ? "bg-sky-400/20" : "bg-sky-300/40"
            )}
          />
          <div className="relative flex items-center gap-2.5">
            <span
              className={cn(
                "grid size-9 place-items-center rounded-xl",
                isDark
                  ? "bg-sky-400/15 text-sky-300 ring-1 ring-sky-400/25"
                  : "bg-white text-sky-700 shadow-sm ring-1 ring-sky-200/80"
              )}
            >
              <Sparkles className="size-4" />
            </span>
            <div>
              <p
                className={cn(
                  "font-heading text-base tracking-tight",
                  isDark ? "text-white" : "text-slate-900"
                )}
              >
                Credits
              </p>
              <p
                className={cn(
                  "text-[11px]",
                  isDark ? "text-slate-400" : "text-slate-500"
                )}
              >
                Balance for new flipbooks
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2 px-3 py-3">
          <div
            className={cn(
              "flex items-center gap-3 rounded-xl border px-3 py-2.5",
              isDark
                ? "border-white/10 bg-white/[0.04]"
                : "border-white/70 bg-white/70"
            )}
          >
            <span
              className={cn(
                "grid size-8 shrink-0 place-items-center rounded-lg",
                isDark
                  ? "bg-sky-400/15 text-sky-300"
                  : "bg-sky-100 text-sky-700"
              )}
            >
              <Coins className="size-3.5" />
            </span>
            <div className="min-w-0">
              <p
                className={cn(
                  "text-[10px] font-medium tracking-[0.16em] uppercase",
                  isDark ? "text-slate-400" : "text-slate-500"
                )}
              >
                Available
              </p>
              <p
                className={cn(
                  "mt-0.5 text-sm font-semibold",
                  isDark ? "text-white" : "text-slate-900"
                )}
              >
                {usable
                  ? `${left} ${left === 1 ? "credit" : "credits"}`
                  : expired
                    ? "0 usable (expired)"
                    : `0 credits`}
              </p>
            </div>
          </div>

          <div
            className={cn(
              "flex items-center gap-3 rounded-xl border px-3 py-2.5",
              isDark
                ? "border-white/10 bg-white/[0.04]"
                : "border-white/70 bg-white/70"
            )}
          >
            <span
              className={cn(
                "grid size-8 shrink-0 place-items-center rounded-lg",
                isDark
                  ? "bg-rose-400/15 text-rose-300"
                  : "bg-rose-100 text-rose-700"
              )}
            >
              <CalendarDays className="size-3.5" />
            </span>
            <div className="min-w-0">
              <p
                className={cn(
                  "text-[10px] font-medium tracking-[0.16em] uppercase",
                  isDark ? "text-slate-400" : "text-slate-500"
                )}
              >
                Free credit
              </p>
              <p
                className={cn(
                  "mt-0.5 text-sm font-medium",
                  expired
                    ? isDark
                      ? "text-rose-300"
                      : "text-rose-700"
                    : isDark
                      ? "text-slate-200"
                      : "text-slate-700"
                )}
              >
                {expireLabel
                  ? expired
                    ? `Expired: ${expireLabel}`
                    : `Expires: ${expireLabel}`
                  : "No expiry date"}
              </p>
            </div>
          </div>
        </div>

        <div
          className={cn(
            "border-t px-3 py-3",
            isDark ? "border-white/10 bg-black/20" : "border-stone-200/70 bg-white/40"
          )}
        >
          <p
            className={cn(
              "text-xs",
              isDark ? "text-slate-300" : "text-slate-600"
            )}
          >
            Need more credits?
          </p>
          <Link
            href={ROUTES.dashboardPlans}
            className={cn(
              "mt-2 inline-flex h-9 w-full cursor-pointer items-center justify-center gap-1.5 rounded-full px-3 text-xs font-semibold text-white transition hover:brightness-110 active:scale-[0.98]",
              "bg-linear-to-r from-sky-500 to-rose-500"
            )}
          >
            View Plans
            <ChevronRight className="size-3.5 opacity-90" />
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
