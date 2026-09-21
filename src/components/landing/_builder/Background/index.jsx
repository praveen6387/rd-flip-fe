"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { useLandingTheme } from "@/lib/landing/ThemeProvider";
import Glows from "./_builder/Glows";
import Grid from "./_builder/Grid";
import Orb from "./_builder/Orb";

export default function Background() {
  const { isDark } = useLandingTheme();
  const pathname = usePathname();
  // Home uses LandingBand bg + AmbientFx — skip extra canvases/blurs there.
  const isLandingHome = pathname === "/";

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-0 z-0 overflow-hidden transition-colors duration-500",
        isDark
          ? "bg-linear-to-br from-[#07070f] via-[#0d111c] to-[#12101a]"
          : "bg-linear-to-br from-white via-[#faf1fb] to-slate-50"
      )}
    >
      {isLandingHome ? null : (
        <>
          <Grid isDark={isDark} />
          <Glows isDark={isDark} />
          <Orb />
        </>
      )}
    </div>
  );
}
