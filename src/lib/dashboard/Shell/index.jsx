"use client";

import Atmosphere from "@/lib/dashboard/_builder/Atmosphere";
import Sidebar from "@/lib/dashboard/Sidebar";
import DashboardHeader from "@/lib/dashboard/Header";
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
        "relative flex min-h-full flex-1 overflow-hidden transition-colors duration-300",
        isDark ? "text-slate-100" : "text-slate-900"
      )}
    >
      <Atmosphere />
      <div className="relative z-10 flex min-h-full flex-1">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <DashboardHeader />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
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
