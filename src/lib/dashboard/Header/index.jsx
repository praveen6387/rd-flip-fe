"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import { useAuth } from "@/components/auth";
import UserMenu from "@/components/auth/_builder/UserMenu";
import MobileSidebar from "@/lib/dashboard/Sidebar/MobileSidebar";
import ThemeToggle from "@/lib/dashboard/_builder/ThemeToggle";
import { useDashboardTheme } from "@/lib/dashboard/ThemeProvider";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/cn";
import {
  DASHBOARD_NAV_ITEMS,
  isDashboardNavActive,
} from "@/lib/dashboard/Sidebar/_builder/nav-items";

export default function DashboardHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { isDark } = useDashboardTheme();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const activeItem =
    DASHBOARD_NAV_ITEMS.find((item) =>
      isDashboardNavActive(pathname, item.href)
    ) ?? DASHBOARD_NAV_ITEMS[0];

  function handleLogout() {
    logout();
    router.push(ROUTES.home);
  }

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b px-3 backdrop-blur-2xl transition-colors duration-300 sm:h-16 sm:px-6",
          isDark
            ? "border-white/10 bg-[#0f1419]/70 shadow-[inset_0_-1px_0_rgba(255,255,255,0.06)]"
            : "border-[#d9cfc0]/55 bg-[#f4efe6]/55 shadow-[inset_0_-1px_0_rgba(255,255,255,0.45)]"
        )}
      >
        <div className="flex min-w-0 items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              "shrink-0 md:hidden",
              isDark
                ? "text-slate-200 hover:bg-white/10 hover:text-white"
                : "text-stone-700 hover:bg-[#e8dfd2]/70 hover:text-stone-900"
            )}
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </Button>
          <div className="min-w-0">
            <p
              className={cn(
                "text-[11px] font-medium tracking-[0.16em] uppercase",
                isDark ? "text-slate-400" : "text-stone-500"
              )}
            >
              Dashboard
            </p>
            <h1
              className={cn(
                "truncate text-sm font-semibold sm:text-base",
                isDark ? "text-white" : "text-stone-900"
              )}
            >
              {activeItem.label}
            </h1>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <ThemeToggle />
          {user ? (
            <UserMenu
              user={user}
              onLogout={handleLogout}
              appearance={isDark ? "dark" : "light"}
            />
          ) : null}
        </div>
      </header>

      <MobileSidebar open={mobileNavOpen} onOpenChange={setMobileNavOpen} />
    </>
  );
}
