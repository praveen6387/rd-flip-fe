"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Play } from "lucide-react";
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

export default function Content() {
  return (
    <div className="flex w-full max-w-none flex-col lg:pr-2">
      <div className="lg:pt-2">
        <motion.p
          className="text-xs font-semibold tracking-[0.22em] text-violet-200/70 uppercase sm:text-sm"
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0.05}
        >
          Next Gen Photo Albums
        </motion.p>

        <motion.h1
          className="mt-4 font-heading text-5xl font-bold leading-[1.05] tracking-tight text-white sm:mt-5 sm:text-6xl lg:text-[4.5rem] xl:text-[4.85rem]"
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0.15}
        >
          Create. Share. Impress.
        </motion.h1>

        <motion.p
          className="mt-5 max-w-xl text-lg leading-8 text-slate-300 sm:mt-6 sm:text-xl sm:leading-9"
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0.28}
        >
          A modern way for photography studios to deliver albums that clients
          love.
        </motion.p>

        <motion.div
          className="mt-8 flex flex-wrap items-center gap-4 sm:mt-9"
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0.4}
        >
          <Link
            href={ROUTES.dashboardCreateFlipbook}
            className="group inline-flex h-12 items-center gap-2.5 rounded-full bg-linear-to-r from-[#8f5678] to-[#c48a9e] px-7 text-base font-semibold text-white shadow-[0_12px_28px_-10px_rgba(196,138,158,0.55)] transition hover:from-[#7a4868] hover:to-[#b87a90] sm:h-14 sm:px-8 sm:text-lg"
          >
            Create Flipbook
            <ArrowRight className="size-5 transition-transform group-hover:translate-x-0.5" />
          </Link>

          <Link
            href="#gallery"
            className="group inline-flex h-12 items-center gap-3 rounded-full border border-white/25 bg-white/8 px-6 text-base font-semibold text-white backdrop-blur-sm transition hover:border-white/40 hover:bg-white/14 sm:h-14 sm:px-7 sm:text-lg"
          >
            <span className="grid size-8 place-items-center rounded-full border border-white/35 text-white">
              <Play className="size-3.5 fill-current" />
            </span>
            View Demo
          </Link>
        </motion.div>
      </div>

      <motion.div
        className="mt-10 sm:mt-12"
        variants={fadeUp}
        initial="hidden"
        animate="show"
        custom={0.55}
      >
        <FeatureHighlights />
      </motion.div>
    </div>
  );
}
