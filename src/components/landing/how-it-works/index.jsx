"use client";

import { useLandingTheme } from "@/lib/landing/ThemeProvider";
import Content from "./_builder/Content";

export default function HowItWorksSection() {
  const { isDark } = useLandingTheme();

  return (
    <section id="how-it-works" className="scroll-mt-24">
      <div className="mx-auto w-full max-w-7xl px-6 py-14 sm:py-16">
        <Content isDark={isDark} />
      </div>
    </section>
  );
}
