"use client";

import Image from "next/image";
import { motion } from "motion/react";

const ease = [0.22, 1, 0.36, 1];

export default function HeroVisual() {
  return (
    <motion.div
      className="relative mx-auto w-full max-w-2xl lg:mx-0 lg:max-w-none lg:w-[min(100%,46rem)] xl:w-[min(100%,52rem)]"
      initial={{ opacity: 0, x: 48, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 0.9, delay: 0.25, ease }}
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{
          duration: 5.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Image
          src="/v2/home/right-home-trans.png"
          alt="RD Flip album preview on desktop and mobile with QR sharing"
          width={1536}
          height={1024}
          priority
          className="h-auto w-full object-contain drop-shadow-[0_28px_60px_rgba(0,0,0,0.55)] lg:scale-105 lg:origin-right xl:scale-110"
          sizes="(max-width: 1024px) 92vw, 55vw"
        />
      </motion.div>
    </motion.div>
  );
}
