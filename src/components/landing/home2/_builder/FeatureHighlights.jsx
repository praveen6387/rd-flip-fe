"use client";

import { CloudUpload, Monitor, QrCode, Smartphone } from "lucide-react";
import { m } from "motion/react";
import { cn } from "@/lib/cn";

const HIGHLIGHTS = [
  { label: "No App Required", Icon: Smartphone },
  { label: "QR Sharing", Icon: QrCode },
  { label: "Cloud Storage", Icon: CloudUpload },
  { label: "Works on All Devices", Icon: Monitor },
];

const ease = [0.22, 1, 0.36, 1];

export default function FeatureHighlights({ isDark = true }) {
  return (
    <ul className="flex flex-wrap items-start gap-x-3 gap-y-4 sm:gap-x-4">
      {HIGHLIGHTS.map(({ label, Icon }, index) => (
        <m.li
          key={label}
          className="flex w-[4.5rem] flex-col items-center text-center transition-transform duration-200 will-change-transform hover:-translate-y-1 sm:w-[5rem]"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.35 + index * 0.05, ease }}
        >
          <span
            className={cn(
              "grid size-12 place-items-center rounded-full border sm:size-14",
              isDark
                ? "border-white/15 bg-white/8 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.55)]"
                : "border-white/60 bg-white/35 shadow-[0_8px_24px_-12px_rgba(109,61,92,0.28)]"
            )}
          >
            <Icon
              className={cn(
                "size-6 sm:size-7",
                isDark ? "text-violet-100" : "text-[#5a324c]"
              )}
              strokeWidth={1.55}
              aria-hidden
            />
          </span>
          <span
            className={cn(
              "mt-2 text-[11px] font-semibold leading-tight sm:text-xs",
              isDark ? "text-slate-200" : "text-slate-700"
            )}
          >
            {label}
          </span>
        </m.li>
      ))}
    </ul>
  );
}
