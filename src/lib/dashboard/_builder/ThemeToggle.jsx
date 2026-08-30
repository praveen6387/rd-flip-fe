"use client";

import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/cn";
import { useDashboardTheme } from "@/lib/dashboard/ThemeProvider";

export default function ThemeToggle() {
  const { isDark, setTheme } = useDashboardTheme();

  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-2.5 rounded-full border px-3 py-1.5 text-sm font-medium backdrop-blur-md transition",
        isDark
          ? "border-white/15 bg-white/10 text-slate-100"
          : "border-[#d9cfc0]/70 bg-white/55 text-stone-700"
      )}
    >
      <span className="whitespace-nowrap">Dark mode</span>
      <Switch
        checked={isDark}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
        className={cn(
          isDark
            ? "data-checked:bg-sky-500 data-unchecked:bg-white/25"
            : "data-checked:bg-sky-600 data-unchecked:bg-stone-300"
        )}
        aria-label="Toggle dark mode"
      />
    </label>
  );
}
