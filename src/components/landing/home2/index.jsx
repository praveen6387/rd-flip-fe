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
      className="relative z-10 flex scroll-mt-0 flex-col md:h-dvh md:min-h-dvh md:overflow-hidden"
    >
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 pt-20 pb-10 sm:px-6 md:h-full md:flex-1 md:justify-between md:gap-6 md:pt-20 md:pb-8 lg:gap-8 lg:pb-10">
        <div className="grid items-center gap-6 md:min-h-0 md:flex-1 md:gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)] lg:gap-4 xl:gap-2">
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
