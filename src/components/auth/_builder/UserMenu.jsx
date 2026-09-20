"use client";

import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, Globe, LayoutDashboard, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/cn";
import { ROUTES } from "@/lib/routes";
import ThemeToggle from "@/lib/dashboard/_builder/ThemeToggle";
import { startNavProgress } from "@/lib/dashboard/_builder/NavProgress";

function getInitials(user) {
  const first = user?.first_name?.[0] ?? "";
  const last = user?.last_name?.[0] ?? "";
  const initials = `${first}${last}`.toUpperCase();
  return initials || "U";
}

export default function UserMenu({
  user,
  onLogout,
  appearance = "light",
  showMobileThemeToggle = false,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const onDashboard = pathname.startsWith(ROUTES.dashboard);
  const isDark = appearance === "dark";
  const displayName =
    [user?.first_name, user?.last_name].filter(Boolean).join(" ") || "Account";
  const initials = getInitials(user);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "h-11 gap-2.5 rounded-full border py-1 pr-3 pl-1.5 shadow-none transition",
            isDark
              ? "border-white/15 bg-white/10 text-white hover:bg-white/15"
              : "border-[#d9cfc0]/70 bg-white/50 text-stone-800 backdrop-blur-md hover:bg-white/75"
          )}
        >
          <span className="flex size-8 items-center justify-center rounded-full bg-linear-to-br from-sky-500 to-rose-500 text-xs font-semibold tracking-wide text-white shadow-inner">
            {initials}
          </span>
          <span className="hidden max-w-36 truncate text-sm font-semibold tracking-tight sm:inline">
            {displayName}
          </span>
          <ChevronDown
            className={cn(
              "size-4",
              isDark ? "text-slate-400" : "text-sky-500/80"
            )}
          />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={6}
        className={cn(
          "min-w-52 overflow-hidden rounded-2xl border p-1.5 shadow-xl",
          isDark
            ? "border-white/12 bg-[#151b22]/98 text-slate-100 backdrop-blur-xl"
            : "border-[#d9cfc0]/70 bg-[#fbf8f3]/98 text-slate-900 backdrop-blur-xl"
        )}
      >
        <div
          className={cn(
            "flex items-center gap-2.5 rounded-xl px-2.5 py-2",
            isDark
              ? "bg-white/[0.05]"
              : "bg-linear-to-br from-sky-50 to-rose-50"
          )}
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-sky-500 to-rose-500 text-xs font-semibold text-white">
            {initials}
          </span>
          <div className="min-w-0">
            <p
              className={cn(
                "truncate text-sm font-semibold",
                isDark ? "text-white" : "text-slate-900"
              )}
            >
              {displayName}
            </p>
            {user?.email ? (
              <p
                className={cn(
                  "truncate text-xs",
                  isDark ? "text-slate-400" : "text-slate-500"
                )}
              >
                {user.email}
              </p>
            ) : null}
          </div>
        </div>

        {showMobileThemeToggle ? (
          <div className="mt-1 px-0.5 md:hidden">
            <ThemeToggle variant="menu" />
          </div>
        ) : null}

        <DropdownMenuSeparator
          className={cn("my-1.5", isDark ? "bg-white/10" : "bg-stone-200/80")}
        />

        {onDashboard ? (
          <DropdownMenuItem
            className={cn(
              "cursor-pointer gap-2 rounded-lg px-2.5 py-2",
              isDark
                ? "focus:bg-white/10 focus:text-white"
                : "focus:bg-white/80"
            )}
            onClick={() => {
              startNavProgress();
              router.push(ROUTES.home);
            }}
          >
            <Globe className="size-4 opacity-80" />
            Go to website
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            className={cn(
              "cursor-pointer gap-2 rounded-lg px-2.5 py-2",
              isDark
                ? "focus:bg-white/10 focus:text-white"
                : "focus:bg-white/80"
            )}
            onClick={() => {
              startNavProgress();
              router.push(ROUTES.dashboard);
            }}
          >
            <LayoutDashboard className="size-4 opacity-80" />
            Dashboard
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          className={cn(
            "cursor-pointer gap-2 rounded-lg px-2.5 py-2 text-rose-600 focus:bg-rose-500/10 focus:text-rose-600",
            isDark && "text-rose-300 focus:bg-rose-500/15 focus:text-rose-200"
          )}
          onClick={onLogout}
        >
          <LogOut className="size-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
