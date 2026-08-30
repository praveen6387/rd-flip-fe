"use client";

import Atmosphere from "@/lib/dashboard/_builder/Atmosphere";
import Sidebar from "@/lib/dashboard/Sidebar";
import DashboardHeader from "@/lib/dashboard/Header";
import NavProgress from "@/lib/dashboard/_builder/NavProgress";
import {
  DashboardThemeProvider,
  useDashboardTheme,
} from "@/lib/dashboard/ThemeProvider";
import { cn } from "@/lib/cn";

function ShellInner({ children }) {
  const { isDark } = useDashboardTheme();

  return (
    <div
      data-dashboard-theme={isDark ? "dark" : "light"}
      className={cn(
        "relative flex h-dvh overflow-hidden transition-colors duration-300",
        isDark ? "text-slate-100" : "text-slate-900"
      )}
    >
      <Atmosphere />
      <div className="relative z-10 flex min-h-0 min-w-0 flex-1">
        <Sidebar />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <DashboardHeader />
          <div className="relative min-h-0 flex-1">
            <main className="h-full overflow-y-auto overscroll-contain p-4 sm:p-6 lg:p-8">
              {children}
            </main>
          </div>
        </div>
      </div>
      <NavProgress />
    </div>
  );
}

export default function DashboardShell({ children }) {
  return (
    <DashboardThemeProvider>
      <ShellInner>{children}</ShellInner>
    </DashboardThemeProvider>
  );
}
