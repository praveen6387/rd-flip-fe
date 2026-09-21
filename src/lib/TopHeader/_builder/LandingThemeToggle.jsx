"use client";

import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/cn";
import { useLandingTheme } from "@/lib/landing/ThemeProvider";

export default function LandingThemeToggle({ light = false, className }) {
  const { isDark, setTheme } = useLandingTheme();

  return (
    <button
      type="button"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "grid size-10 shrink-0 place-items-center rounded-full border transition",
        light
          ? "border-white/25 bg-white/10 text-white hover:bg-white/16"
          : "border-slate-200/80 bg-white/70 text-slate-700 hover:bg-white",
        className
      )}
    >
      {isDark ? (
        <Sun className="size-4" strokeWidth={1.75} />
      ) : (
        <Moon className="size-4" strokeWidth={1.75} />
      )}
    </button>
  );
}
