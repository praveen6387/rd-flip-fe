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
import { ROUTES } from "@/lib/routes";

function getInitials(user) {
  const first = user?.first_name?.[0] ?? "";
  const last = user?.last_name?.[0] ?? "";
  const initials = `${first}${last}`.toUpperCase();
  return initials || "U";
}

export default function UserMenu({ user, onLogout }) {
  const router = useRouter();
  const pathname = usePathname();
  const onDashboard = pathname.startsWith(ROUTES.dashboard);
  const displayName =
    [user?.first_name, user?.last_name].filter(Boolean).join(" ") || "Account";
  const initials = getInitials(user);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-11 gap-2.5 rounded-full border-0 bg-transparent py-1 pr-3 pl-1.5 text-slate-800 shadow-none ring-0 transition hover:bg-indigo-50/70"
        >
          <span className="flex size-8 items-center justify-center rounded-full bg-linear-to-br from-indigo-500 to-sky-500 text-xs font-semibold tracking-wide text-white shadow-inner">
            {initials}
          </span>
          <span className="max-w-36 truncate text-sm font-semibold tracking-tight">
            {displayName}
          </span>
          <ChevronDown className="size-4 text-indigo-400" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="min-w-52 rounded-2xl border-indigo-100/80 p-1.5 shadow-xl"
      >
        <div className="flex items-center gap-3 rounded-xl bg-linear-to-br from-indigo-50 to-sky-50 px-3 py-2.5">
          <span className="flex size-9 items-center justify-center rounded-full bg-linear-to-br from-indigo-500 to-sky-500 text-xs font-semibold text-white">
            {initials}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">
              {displayName}
            </p>
            {user?.email ? (
              <p className="truncate text-xs text-slate-500">{user.email}</p>
            ) : null}
          </div>
        </div>

        <DropdownMenuSeparator className="my-1.5" />

        {onDashboard ? (
          <DropdownMenuItem
            className="rounded-lg px-2.5 py-2"
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
