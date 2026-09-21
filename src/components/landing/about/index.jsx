"use client";

import { useLandingTheme } from "@/lib/landing/ThemeProvider";
import Content from "./_builder/Content";

export default function AboutSection() {
  const { isDark } = useLandingTheme();

  return (
    <section id="about" className="relative z-10 scroll-mt-24 overflow-hidden">
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-14 sm:py-16">
        <Content isDark={isDark} />
      </div>
    </section>
  );
}
