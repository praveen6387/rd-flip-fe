"use client";

import { CloudUpload, Monitor, QrCode, Smartphone } from "lucide-react";
import { motion } from "motion/react";
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
    <ul className="flex flex-wrap items-start gap-x-6 gap-y-5 sm:gap-x-8">
      {HIGHLIGHTS.map(({ label, Icon }, index) => (
        <motion.li
          key={label}
          className="flex w-[5.5rem] flex-col items-center text-center sm:w-[6.25rem]"
          initial={{ opacity: 0, y: 18, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, delay: 0.62 + index * 0.08, ease }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
        >
          <span
            className={cn(
              "grid size-16 place-items-center rounded-full border backdrop-blur-xl sm:size-[4.25rem]",
              isDark
                ? "border-white/15 bg-white/8 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.55)]"
                : "border-white/60 bg-white/35 shadow-[0_8px_24px_-12px_rgba(109,61,92,0.28)]"
            )}
          >
            <Icon
              className={cn(
                "size-8 sm:size-9",
                isDark ? "text-violet-100" : "text-[#5a324c]"
              )}
              strokeWidth={1.55}
              aria-hidden
            />
          </span>
          <span
            className={cn(
              "mt-2.5 text-xs font-semibold leading-tight sm:text-sm",
              isDark ? "text-slate-200" : "text-slate-700"
            )}
          >
            {label}
          </span>
        </motion.li>
      ))}
    </ul>
  );
}
