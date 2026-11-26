"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { useLandingTheme } from "@/lib/landing/ThemeProvider";
import GoogleTranslate from "@/components/GoogleTranslate";
import AuthButtons from "./_builder/AuthButtons";
import LandingThemeToggle from "./_builder/LandingThemeToggle";
import Logo from "./_builder/Logo";
import MobileNav from "./_builder/MobileNav";
import NavLinks from "./_builder/NavLinks";
import { useActiveSection } from "./_builder/useActiveSection";

export default function TopHeader() {
  const pathname = usePathname();
  const active = useActiveSection();
  const { isDark } = useLandingTheme();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!isHome) {
      setScrolled(true);
      return undefined;
    }

    function onScroll() {
      setScrolled(window.scrollY > 24);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  const solid = !isHome || scrolled;

  return (
    <header
      className={cn(
        "z-50 font-sans transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300",
        isHome ? "fixed inset-x-0 top-0" : "sticky top-0",
        solid
          ? isDark
            ? "border-b border-white/10 bg-[#0b1017]/88 shadow-sm backdrop-blur-md"
            : "border-b border-slate-200/80 bg-white/80 shadow-sm backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-2 px-3 md:h-20 md:gap-6 md:px-4">
        <Logo pathname={pathname} light={isDark} />
        <NavLinks pathname={pathname} active={active} light={isDark} />
        <div className="flex shrink-0 items-center gap-1.5 md:gap-2">
          <div className="hidden items-center gap-2 md:flex">
            <LandingThemeToggle light={isDark} />
            <GoogleTranslate appearance={isDark ? "dark" : "light"} />
          </div>
          <AuthButtons light={isDark} />
          <MobileNav
            pathname={pathname}
            active={active}
            solid={solid}
            light={isDark}
            darkSolid={solid && isDark}
          />
        </div>
      </div>
    </header>
  );
}
