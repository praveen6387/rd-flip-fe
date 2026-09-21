"use client";

import { CloudUpload, Monitor, QrCode, Smartphone } from "lucide-react";
import { motion } from "motion/react";

const HIGHLIGHTS = [
  { label: "No App Required", Icon: Smartphone },
  { label: "QR Sharing", Icon: QrCode },
  { label: "Cloud Storage", Icon: CloudUpload },
  { label: "Works on All Devices", Icon: Monitor },
];

const ease = [0.22, 1, 0.36, 1];

export default function FeatureHighlights() {
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
          <span className="grid size-16 place-items-center rounded-full border border-white/15 bg-white/8 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.55)] backdrop-blur-xl sm:size-[4.25rem]">
            <Icon
              className="size-8 text-violet-100 sm:size-9"
              strokeWidth={1.55}
              aria-hidden
            />
          </span>
          <span className="mt-2.5 text-xs font-semibold leading-tight text-slate-200 sm:text-sm">
            {label}
          </span>
        </motion.li>
      ))}
    </ul>
  );
}
