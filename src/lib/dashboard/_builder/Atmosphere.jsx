"use client";

import { cn } from "@/lib/cn";
import { useDashboardTheme } from "@/lib/dashboard/ThemeProvider";

export default function Atmosphere() {
  const { isDark } = useDashboardTheme();

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div
        className={cn(
          "absolute inset-0 bg-cover bg-center bg-no-repeat",
          isDark && "opacity-30"
        )}
        style={{ backgroundImage: "url(/dashboard/dashboard-bg.png)" }}
      />
      {isDark ? <div className="absolute inset-0 bg-[#070b12]/82" /> : null}
    </div>
  );
}
