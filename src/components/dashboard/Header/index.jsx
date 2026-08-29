"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth";
import UserMenu from "@/components/auth/_builder/UserMenu";
import { ROUTES } from "@/lib/routes";

export default function DashboardHeader() {
  const router = useRouter();
  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
    router.push(ROUTES.home);
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/90 px-6 backdrop-blur">
      <div>
        <h1 className="text-base font-semibold text-slate-900">Dashboard</h1>
        <p className="text-xs text-slate-500">Manage your studio and flipbooks</p>
      </div>
      {user ? <UserMenu user={user} onLogout={handleLogout} /> : null}
    </header>
  );
}
