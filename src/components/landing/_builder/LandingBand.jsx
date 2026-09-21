"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { useLandingTheme } from "@/lib/landing/ThemeProvider";
import Particles from "./Background/_builder/Particles";
import Bubbles from "./Background/_builder/Bubbles";

/** Upscaled asset (~3×) so full-viewport CSS bg stays sharp on laptop/retina. */
const BG_SRC = "/v2/home/bg-8-3-hd.png";
const BG_WIDTH = 2172;
const BG_HEIGHT = 6516;
/** Overlap between tiles so the join can soft-fade. */
const OVERLAP = 0.16;

function tileMask(index, count) {
  if (count <= 1) return undefined;
  if (index === 0) {
    return "linear-gradient(to bottom, #000 0%, #000 82%, transparent 100%)";
  }
  if (index === count - 1) {
    return "linear-gradient(to bottom, transparent 0%, #000 18%, #000 100%)";
  }
  return "linear-gradient(to bottom, transparent 0%, #000 18%, #000 82%, transparent 100%)";
}

export default function LandingBand({ children }) {
  const { isDark } = useLandingTheme();
  const rootRef = useRef(null);
  const [tiles, setTiles] = useState({ count: 1, tileH: 0, step: 0 });

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return undefined;

    function measure() {
      const bandH = el.offsetHeight;
      const bandW = el.offsetWidth || window.innerWidth;
      const tileH = bandW * (BG_HEIGHT / BG_WIDTH);
      const step = tileH * (1 - OVERLAP);
      const count = Math.max(
        1,
        Math.ceil(Math.max(0, bandH - tileH) / step) + 1
      );
      setTiles({ count, tileH, step });
    }

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = BG_SRC;
    document.head.appendChild(link);
    return () => {
      link.remove();
    };
  }, []);

  return (
    <div ref={rootRef} className="relative isolate">
      {/* Background image — bottom layer */}
      <div
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        aria-hidden
      >
        {Array.from({ length: tiles.count }, (_, index) => {
          const mask = tileMask(index, tiles.count);
          return (
            <div
              key={index}
              className={cn(
                "absolute inset-x-0 w-full",
                isDark &&
                  "brightness-[0.42] contrast-[1.05] saturate-[1.12]"
              )}
              style={{
                top: index * tiles.step,
                height: tiles.tileH || undefined,
                backgroundImage: `url("${BG_SRC}")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "top center",
                backgroundSize: "100% auto",
                WebkitMaskImage: mask,
                maskImage: mask,
                WebkitMaskSize: "100% 100%",
                maskSize: "100% 100%",
              }}
            />
          );
        })}
        {isDark ? (
          <>
            <div className="absolute inset-0 bg-linear-to-b from-[#07070f]/70 via-[#0b1020]/40 to-[#07070f]/65" />
            <div className="absolute inset-0 bg-linear-to-r from-[#07070f]/55 via-transparent to-[#07070f]/25" />
          </>
        ) : null}
      </div>

      {/* Floating particles + bubbles — above bg, below content */}
      <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden">
        <Particles density={12000} maxCount={140} minAlpha={0.4} maxAlpha={0.9} />
        <Bubbles count={20} minSize={5} maxSize={16} />
      </div>

      <div className="relative z-[2]">{children}</div>
    </div>
  );
}
