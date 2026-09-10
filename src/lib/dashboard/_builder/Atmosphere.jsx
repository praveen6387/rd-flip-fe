"use client";

import { cn } from "@/lib/cn";
import { useDashboardTheme } from "@/lib/dashboard/ThemeProvider";
import Particles from "@/components/landing/_builder/Background/_builder/Particles";

const DARK_COLORS = [
  "rgba(125,211,252,",
  "rgba(253,164,175,",
  "rgba(148,163,184,",
];

const LIGHT_COLORS = [
  "rgba(14,165,233,",
  "rgba(244,114,182,",
  "rgba(180,140,100,",
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
          isDark ? "bg-[#0b1017]" : "bg-[#f6f1e9]"
        )}
      />
      <div
        className={cn(
          "absolute inset-0",
          isDark
            ? "bg-[radial-gradient(ellipse_80%_55%_at_12%_-5%,rgba(56,189,248,0.12),transparent_58%)]"
            : "bg-[radial-gradient(ellipse_85%_60%_at_8%_-10%,rgba(125,211,252,0.28),transparent_62%)]"
        )}
      />
      <div
        className={cn(
          "absolute inset-0",
          isDark
            ? "bg-[radial-gradient(ellipse_70%_50%_at_92%_108%,rgba(244,63,94,0.1),transparent_55%)]"
            : "bg-[radial-gradient(ellipse_75%_55%_at_98%_108%,rgba(251,146,160,0.2),transparent_58%)]"
        )}
      />
      <div
        className={cn(
          "absolute inset-0",
          isDark
            ? "bg-[radial-gradient(ellipse_50%_40%_at_50%_38%,rgba(30,41,59,0.4),transparent_72%)]"
            : "bg-[radial-gradient(ellipse_60%_50%_at_48%_32%,rgba(255,252,248,0.82),transparent_70%)]"
        )}
      />
      <div
        className={cn(
          "dash-atmosphere-orb absolute -top-28 -left-20 size-[30rem] rounded-full blur-[100px]",
          isDark ? "bg-sky-500/14" : "bg-sky-200/50"
        )}
      />
      <div
        className={cn(
          "dash-atmosphere-orb-delayed absolute top-[38%] -right-28 size-[26rem] rounded-full blur-[100px]",
          isDark ? "bg-rose-500/12" : "bg-rose-200/45"
        )}
      />
      <div
        className={cn(
          "absolute inset-0",
          isDark
            ? "bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(5,8,14,0.5)_100%)]"
            : "bg-[radial-gradient(ellipse_at_center,transparent_52%,rgba(198,178,148,0.18)_100%)]"
        )}
      />
      {isDark ? <div className="absolute inset-0 bg-[#0b1017]/20" /> : null}
      <Particles
        colors={isDark ? DARK_COLORS : LIGHT_COLORS}
        density={isDark ? 52000 : 48000}
      />
    </div>
  );
}
