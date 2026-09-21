"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";
import { ROUTES } from "@/lib/routes";
import FeatureHighlights from "./FeatureHighlights";

const ease = [0.22, 1, 0.36, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay, ease },
  }),
};

export default function Content({ isDark = true }) {
  return (
    <div className="flex w-full max-w-none flex-col lg:pr-2">
      <div className="lg:pt-2">
        <motion.div
          className={cn(
            "inline-flex max-w-full items-stretch overflow-hidden rounded-full border backdrop-blur-md",
            isDark
              ? "border-white/15 bg-white/5"
              : "border-white/50 bg-white/20"
          )}
          style={{ borderRadius: 9999 }}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0.05}
        >
          <span
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-l-full px-3 py-1.5 sm:px-3.5 sm:py-2",
              isDark ? "bg-violet-300/12" : "bg-[#d8c4eb]/28"
            )}
          >
            <Sparkles
              className={cn(
                "size-3.5 shrink-0 sm:size-4",
                isDark ? "text-amber-300" : "text-amber-500"
              )}
              fill="currentColor"
            />
            <span
              className={cn(
                "text-[10px] font-semibold tracking-[0.12em] uppercase sm:text-[11px]",
                isDark ? "text-violet-100" : "text-[#5a3d72]"
              )}
            >
              Next Gen Photo Albums
            </span>
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-r-full bg-transparent px-3 py-1.5 text-[11px] font-medium sm:px-3.5 sm:py-2 sm:text-xs",
              isDark ? "text-violet-100/90" : "text-[#5a3d72]"
            )}
          >
            Loved by 500+ Studios
            <span aria-hidden className="text-[11px] sm:text-xs">
              ❤️
            </span>
          </span>
        </motion.div>

        <motion.h1
          className={cn(
            "mt-3 font-heading text-4xl font-bold leading-[1.05] tracking-tight sm:mt-3.5 sm:text-5xl lg:text-[3.5rem] xl:text-[3.85rem]",
            isDark ? "text-white" : "text-slate-900"
          )}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0.15}
        >
          Create. Share. Impress.
        </motion.h1>

        <motion.p
          className={cn(
            "mt-4 max-w-lg text-base leading-7 sm:mt-5 sm:text-lg sm:leading-8",
            isDark ? "text-slate-300" : "text-slate-600"
          )}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0.28}
        >
          A modern way for photography studios to deliver albums that clients
          love.
        </motion.p>

        <motion.div
          className="mt-6 flex flex-wrap items-center gap-3 sm:mt-7"
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0.4}
        >
          <Link
            href={ROUTES.dashboardCreateFlipbook}
            className={cn(
              "group inline-flex h-11 items-center gap-2 rounded-full px-6 text-sm font-semibold text-white transition sm:h-12 sm:px-7 sm:text-base",
              isDark
                ? "bg-linear-to-r from-[#8f5678] to-[#c48a9e] shadow-[0_12px_28px_-10px_rgba(196,138,158,0.55)] hover:from-[#7a4868] hover:to-[#b87a90]"
                : "bg-linear-to-r from-[#6d3d5c] to-[#8f5678] shadow-[0_12px_28px_-10px_rgba(109,61,92,0.55)] hover:from-[#5c3450] hover:to-[#7a4868]"
            )}
          >
            Create Flipbook
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>

          <Link
            href="#gallery"
            className={cn(
              "group inline-flex h-11 items-center gap-2.5 rounded-full px-5 text-sm font-semibold backdrop-blur-sm transition sm:h-12 sm:px-6 sm:text-base",
              isDark
                ? "border border-white/25 bg-white/8 text-white hover:border-white/40 hover:bg-white/14"
                : "border border-[#6d3d5c]/60 bg-white/55 text-[#5a324c] hover:border-[#6d3d5c] hover:bg-white/85"
            )}
          >
            <span
              className={cn(
                "grid size-7 place-items-center rounded-full border",
                isDark
                  ? "border-white/35 text-white"
                  : "border-[#6d3d5c]/80 text-[#5a324c]"
              )}
            >
              <Play className="size-3 fill-current" />
            </span>
            View Demo
          </Link>
        </motion.div>
      </div>

      <motion.div
        className="mt-8 sm:mt-9"
        variants={fadeUp}
        initial="hidden"
        animate="show"
        custom={0.55}
      >
        <FeatureHighlights isDark={isDark} />
      </motion.div>
    </div>
  );
}
