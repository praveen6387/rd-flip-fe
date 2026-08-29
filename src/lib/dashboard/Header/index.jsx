"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import { useAuth } from "@/components/auth";
import UserMenu from "@/components/auth/_builder/UserMenu";
import MobileSidebar from "@/lib/dashboard/Sidebar/MobileSidebar";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";

export default function DashboardHeader() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  function handleLogout() {
    logout();
    router.push(ROUTES.home);
  }

  return (
    <>
      <header className="flex h-14 items-center justify-between gap-3 border-b border-slate-200/80 bg-white/90 px-3 backdrop-blur sm:h-16 sm:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 md:hidden"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </Button>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold text-slate-900 sm:text-base">
              Dashboard
            </h1>
            <p className="hidden truncate text-xs text-slate-500 sm:block">
              Manage your studio and flipbooks
            </p>
          </div>
        </div>
        {user ? <UserMenu user={user} onLogout={handleLogout} /> : null}
      </header>

      <MobileSidebar open={mobileNavOpen} onOpenChange={setMobileNavOpen} />
    </>
  );
}
