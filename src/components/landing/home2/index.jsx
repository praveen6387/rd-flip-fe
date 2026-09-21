"use client";

import { useLandingTheme } from "@/lib/landing/ThemeProvider";
import Content from "./_builder/Content";
import HeroVisual from "./_builder/HeroVisual";
import StatsBar from "./_builder/StatsBar";

export default function Home2Section() {
  const { isDark } = useLandingTheme();

  return (
    <section
      id="home"
      className="relative z-10 flex h-dvh min-h-dvh scroll-mt-0 flex-col overflow-hidden"
    >
      <div className="relative z-10 mx-auto flex h-full w-full max-w-7xl flex-1 flex-col justify-between gap-6 px-4 pt-[10.5rem] pb-6 sm:px-6 md:pt-20 md:pb-8 lg:gap-8 lg:pb-10">
        <div className="grid min-h-0 flex-1 items-center gap-4 md:gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)] lg:gap-4 xl:gap-2">
          <Content isDark={isDark} />
          <div className="flex min-w-0 items-center justify-center lg:justify-end lg:pl-2">
            <HeroVisual isDark={isDark} />
          </div>
        </div>

        <StatsBar isDark={isDark} />
      </div>
    </section>
  );
}
