"use client";

import { cn } from "@/lib/cn";
import { useDashboardTheme } from "@/lib/dashboard/ThemeProvider";

const TWINKLES = [
  { top: "8%", left: "12%", size: 2, delay: "0s", duration: "3.2s" },
  { top: "14%", left: "72%", size: 3, delay: "0.6s", duration: "4.1s" },
  { top: "22%", left: "38%", size: 2, delay: "1.4s", duration: "3.6s" },
  { top: "28%", left: "88%", size: 2, delay: "0.2s", duration: "4.8s" },
  { top: "36%", left: "18%", size: 3, delay: "1.8s", duration: "3.9s" },
  { top: "42%", left: "55%", size: 2, delay: "0.9s", duration: "4.4s" },
  { top: "48%", left: "8%", size: 2, delay: "2.1s", duration: "3.5s" },
  { top: "54%", left: "78%", size: 3, delay: "0.4s", duration: "5s" },
  { top: "62%", left: "32%", size: 2, delay: "1.1s", duration: "3.8s" },
  { top: "68%", left: "64%", size: 2, delay: "2.4s", duration: "4.2s" },
  { top: "74%", left: "22%", size: 3, delay: "0.7s", duration: "3.7s" },
  { top: "80%", left: "90%", size: 2, delay: "1.6s", duration: "4.6s" },
  { top: "18%", left: "48%", size: 2, delay: "2.8s", duration: "3.3s" },
  { top: "58%", left: "42%", size: 2, delay: "1.3s", duration: "4.9s" },
  { top: "86%", left: "50%", size: 3, delay: "0.5s", duration: "3.4s" },
  { top: "12%", left: "28%", size: 2, delay: "2s", duration: "4.3s" },
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
          isDark ? "bg-[#0f1419]" : "bg-[#f4efe6]"
        )}
      />
      <div
        className={cn(
          "absolute inset-0",
          isDark
            ? "bg-[radial-gradient(ellipse_at_top,_rgba(56,189,248,0.16),_transparent_55%)]"
            : "bg-[radial-gradient(ellipse_at_top,_rgba(56,189,248,0.14),_transparent_55%)]"
        )}
      />
      <div
        className={cn(
          "absolute inset-0",
          isDark
            ? "bg-[radial-gradient(ellipse_at_bottom_right,_rgba(244,63,94,0.14),_transparent_50%)]"
            : "bg-[radial-gradient(ellipse_at_bottom_right,_rgba(244,63,94,0.1),_transparent_50%)]"
        )}
      />
      <div
        className={cn(
          "dash-atmosphere-orb absolute -top-24 -left-16 size-[28rem] rounded-full blur-3xl",
          isDark ? "bg-sky-500/20" : "bg-sky-300/25"
        )}
      />
      <div
        className={cn(
          "dash-atmosphere-orb-delayed absolute top-1/3 -right-24 size-[24rem] rounded-full blur-3xl",
          isDark ? "bg-rose-500/15" : "bg-rose-300/20"
        )}
      />
      <div
        className={cn(
          "absolute inset-0 bg-size-[48px_48px]",
          isDark
            ? "bg-[linear-gradient(to_right,rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.045)_1px,transparent_1px)]"
            : "bg-[linear-gradient(to_right,rgba(90,70,50,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(90,70,50,0.035)_1px,transparent_1px)]"
        )}
      />

      {TWINKLES.map((spark, index) => (
        <span
          key={index}
          className={cn(
            "dash-twinkle absolute rounded-full",
            isDark
              ? "bg-white shadow-[0_0_8px_rgba(255,255,255,0.55)]"
              : "bg-sky-500/70 shadow-[0_0_8px_rgba(14,165,233,0.45)]"
          )}
          style={{
            top: spark.top,
            left: spark.left,
            width: spark.size,
            height: spark.size,
            animationDelay: spark.delay,
            animationDuration: spark.duration,
          }}
        />
      ))}
    </div>
  );
}
