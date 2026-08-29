"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import { useAuth } from "@/components/auth";
import UserMenu from "@/components/auth/_builder/UserMenu";
import MobileSidebar from "@/lib/dashboard/Sidebar/MobileSidebar";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";
import {
  DASHBOARD_NAV_ITEMS,
  isDashboardNavActive,
} from "@/lib/dashboard/Sidebar/_builder/nav-items";

export default function DashboardHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
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
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b border-[#d9cfc0]/55 bg-[#f4efe6]/55 px-3 shadow-[inset_0_-1px_0_rgba(255,255,255,0.45)] backdrop-blur-2xl sm:h-16 sm:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 text-stone-700 hover:bg-[#e8dfd2]/70 hover:text-stone-900 md:hidden"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </Button>
          <div className="min-w-0">
            <p className="text-[11px] font-medium tracking-[0.16em] text-stone-500 uppercase">
              Dashboard
            </p>
            <h1 className="truncate text-sm font-semibold text-stone-900 sm:text-base">
              {activeItem.label}
            </h1>
          </div>
        </div>
        {user ? (
          <UserMenu user={user} onLogout={handleLogout} appearance="light" />
        ) : null}
      </header>

      <MobileSidebar open={mobileNavOpen} onOpenChange={setMobileNavOpen} />
    </>
  );
}
