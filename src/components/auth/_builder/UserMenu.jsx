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
              isDark ? "text-slate-400" : "text-indigo-400"
            )}
          />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className={cn(
          "min-w-52 rounded-2xl p-1.5 shadow-xl",
            isDark
              ? "border-white/15 bg-[#1a222d]/95 text-slate-100 backdrop-blur-xl"
              : "border-indigo-100/80 bg-popover"
        )}
      >
        <div
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5",
            isDark
              ? "bg-white/5"
              : "bg-linear-to-br from-indigo-50 to-sky-50"
          )}
        >
          <span className="flex size-9 items-center justify-center rounded-full bg-linear-to-br from-sky-500 to-rose-500 text-xs font-semibold text-white">
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
          <div className="px-1 md:hidden">
            <ThemeToggle variant="menu" />
          </div>
        ) : null}

        <DropdownMenuSeparator
          className={cn("my-1.5", isDark && "bg-white/10")}
        />

        {onDashboard ? (
          <DropdownMenuItem
            className={cn(
              "rounded-lg px-2.5 py-2",
              isDark && "focus:bg-white/10 focus:text-white"
            )}
            onClick={() => router.push(ROUTES.home)}
          >
            <Globe className="size-4" />
            Go to website
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            className="rounded-lg px-2.5 py-2"
            onClick={() => router.push(ROUTES.dashboard)}
          >
            <LayoutDashboard className="size-4" />
            Dashboard
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          variant="destructive"
          className="rounded-lg px-2.5 py-2"
          onClick={onLogout}
        >
          <LogOut className="size-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
