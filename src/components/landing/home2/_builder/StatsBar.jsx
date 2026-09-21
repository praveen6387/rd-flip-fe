"use client";

import { BookImage, Headphones, Heart, Users } from "lucide-react";
import { cn } from "@/lib/cn";

const STATS = [
  { value: "500+", label: "Happy Studios", Icon: Users },
  { value: "50K+", label: "Albums Created", Icon: BookImage },
  { value: "99%", label: "Client Satisfaction", Icon: Heart },
  { value: "24/7", label: "Support", Icon: Headphones },
];

export default function StatsBar({ isDark = false }) {
  return (
    <div
      className={cn(
        "flex w-full flex-col gap-4 rounded-[1.75rem] border px-4 py-4 shadow-[0_16px_40px_-20px_rgba(80,60,120,0.22)] backdrop-blur-2xl sm:px-5 sm:py-4 lg:flex-row lg:items-center lg:gap-0 lg:rounded-full lg:px-6",
        isDark
          ? "border-white/15 bg-white/8 ring-1 ring-white/10"
          : "border-white/50 bg-white/25 ring-1 ring-white/40"
      )}
    >
      <ul className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-0 lg:contents">
        {STATS.map(({ value, label, Icon }, index) => (
          <li
            key={label}
            className={cn(
              "flex items-center gap-3 px-2 py-1 sm:justify-center lg:flex-1 lg:px-3",
              index > 0 &&
                (isDark
                  ? "sm:border-l sm:border-white/10"
                  : "sm:border-l sm:border-white/45")
            )}
          >
            <span
              className={cn(
                "grid size-12 shrink-0 place-items-center rounded-full sm:size-14",
                isDark ? "bg-white/10" : "bg-white/40"
              )}
            >
              <Icon
                className={cn(
                  "size-5 sm:size-6",
                  isDark ? "text-[#e8c4d0]" : "text-[#6d3d5c]"
                )}
                strokeWidth={1.75}
              />
            </span>
            <div className="min-w-0">
              <p
                className={cn(
                  "text-base font-bold leading-none tracking-tight sm:text-lg",
                  isDark ? "text-white" : "text-slate-900"
                )}
              >
                {value}
              </p>
              <p
                className={cn(
                  "mt-1 text-xs font-medium leading-tight sm:text-[13px]",
                  isDark ? "text-slate-300" : "text-slate-600"
                )}
              >
                {label}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <div
        className={cn(
          "flex items-center justify-center border-t px-3 pt-3 lg:min-w-[13.5rem] lg:border-t-0 lg:border-l lg:pt-0 lg:pl-5",
          isDark ? "border-white/10" : "border-white/45"
        )}
      >
        <p
          className={cn(
            "font-viewer-title rotate-[-4deg] text-center text-lg font-semibold leading-snug sm:text-xl",
            isDark ? "text-[#e8c4d0]" : "text-[#6d3d5c]"
          )}
        >
          Turn Moments Into Memories
          <span className="ml-1 text-pink-400" aria-hidden>
            ♥
          </span>
        </p>
      </div>
    </div>
  );
}
