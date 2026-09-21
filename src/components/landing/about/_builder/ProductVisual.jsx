"use client";

import Image from "next/image";
import { cn } from "@/lib/cn";
import MotionCard from "@/components/landing/_builder/MotionCard";

export default function ProductVisual({ isDark = false }) {
  return (
    <MotionCard
      index={0}
      className="relative mx-auto w-full max-w-xl sm:max-w-2xl lg:origin-right lg:max-w-none lg:scale-[1.06]"
      hover={false}
    >
      <Image
        src="/v2/product/product-content.png"
        alt="RD Flip flipbooks with QR sharing on mobile"
        width={1374}
        height={1145}
        priority
        quality={95}
        className={cn(
          "h-auto w-full object-contain",
          isDark
            ? "drop-shadow-[0_28px_60px_rgba(0,0,0,0.55)]"
            : "drop-shadow-[0_24px_48px_rgba(80,60,120,0.18)]"
        )}
        sizes="(max-width: 1024px) 90vw, 50vw"
      />
    </MotionCard>
  );
}
