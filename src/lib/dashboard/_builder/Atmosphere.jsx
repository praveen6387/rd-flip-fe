"use client";

import { cn } from "@/lib/cn";
import { useDashboardTheme } from "@/lib/dashboard/ThemeProvider";
import Particles from "@/components/landing/_builder/Background/_builder/Particles";

const DARK_COLORS = [
  "rgba(255,255,255,",
  "rgba(125,211,252,",
  "rgba(253,164,175,",
  "rgba(129,140,248,",
];

const LIGHT_COLORS = [
  "rgba(14,165,233,",
  "rgba(244,63,94,",
  "rgba(99,102,241,",
  "rgba(244,114,182,",
];

export default function Atmosphere() {
  const { isDark } = useDashboardTheme();

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div
        className={cn(
          "absolute inset-0 transition-colors duration-300",
          isDark ? "bg-[#0f1419]" : "bg-[#f4efe6]"
        )}
      />
      <div
        className={cn(
          "absolute inset-0",
          isDark
            ? "bg-[radial-gradient(ellipse_at_top,_rgba(56,189,248,0.16),_transparent_55%)]"
            : "bg-[radial-gradient(ellipse_at_top,_rgba(56,189,248,0.14),_transparent_55%)]"
        )}
      />
      <div
        className={cn(
          "absolute inset-0",
          isDark
            ? "bg-[radial-gradient(ellipse_at_bottom_right,_rgba(244,63,94,0.14),_transparent_50%)]"
            : "bg-[radial-gradient(ellipse_at_bottom_right,_rgba(244,63,94,0.1),_transparent_50%)]"
        )}
      />
      <div
        className={cn(
          "dash-atmosphere-orb absolute -top-24 -left-16 size-[28rem] rounded-full blur-3xl",
          isDark ? "bg-sky-500/20" : "bg-sky-300/25"
        )}
      />
      <div
        className={cn(
          "dash-atmosphere-orb-delayed absolute top-1/3 -right-24 size-[24rem] rounded-full blur-3xl",
          isDark ? "bg-rose-500/15" : "bg-rose-300/20"
        )}
      />
      <div
        className={cn(
          "absolute inset-0 bg-size-[48px_48px]",
          isDark
            ? "bg-[linear-gradient(to_right,rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.045)_1px,transparent_1px)]"
            : "bg-[linear-gradient(to_right,rgba(90,70,50,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(90,70,50,0.035)_1px,transparent_1px)]"
        )}
      />
      <Particles colors={isDark ? DARK_COLORS : LIGHT_COLORS} />
    </div>
  );
}
