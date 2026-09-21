"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { useLandingTheme } from "@/lib/landing/ThemeProvider";
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
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between gap-6 px-4">
        <Logo pathname={pathname} light={isDark} />
        <NavLinks pathname={pathname} active={active} light={isDark} />
        <div className="flex items-center gap-2 sm:gap-3">
          <LandingThemeToggle light={isDark} />
          <AuthButtons light={isDark} />
        </div>
      </div>
      <MobileNav
        pathname={pathname}
        active={active}
        solid={solid}
        light={isDark}
        darkSolid={solid && isDark}
      />
    </header>
  );
}
