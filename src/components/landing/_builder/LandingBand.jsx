"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { useLandingTheme } from "@/lib/landing/ThemeProvider";
import AmbientFx from "./Background/_builder/AmbientFx";
import { MotionProvider } from "./MotionCard";

/** Upscaled asset (~3×) — width fits viewport; height tiles with soft blend. */
const BG_SRC = "/v2/home/bg-8-3-hd.png";
const BG_WIDTH = 2172;
const BG_HEIGHT = 6516;
/** Overlap so fade masks can hide the seam. */
const OVERLAP = 0.18;

function tileMask(index, count) {
  if (count <= 1) return undefined;
  if (index === 0) {
    return "linear-gradient(to bottom, #000 0%, #000 78%, transparent 100%)";
  }
  if (index === count - 1) {
    return "linear-gradient(to bottom, transparent 0%, #000 22%, #000 100%)";
  }
  return "linear-gradient(to bottom, transparent 0%, #000 22%, #000 78%, transparent 100%)";
}

export default function LandingBand({ children }) {
  const { isDark } = useLandingTheme();
  const rootRef = useRef(null);
  const [tiles, setTiles] = useState({ count: 1, tileH: 0, step: 0 });

  useEffect(() => {
    const img = new Image();
    img.src = BG_SRC;
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return undefined;

    let raf = 0;
    function measure() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const bandH = el.offsetHeight;
        const bandW = el.offsetWidth || window.innerWidth;
        const tileH = bandW * (BG_HEIGHT / BG_WIDTH);
        const step = tileH * (1 - OVERLAP);
        const count = Math.max(
          1,
          Math.ceil(Math.max(0, bandH - tileH) / step) + 1
        );
        setTiles((prev) =>
          prev.count === count &&
          Math.abs(prev.tileH - tileH) < 1 &&
          Math.abs(prev.step - step) < 1
            ? prev
            : { count, tileH, step }
        );
      });
    }

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <MotionProvider>
      <div ref={rootRef} className="relative isolate">
        <div
          className={cn(
            "pointer-events-none absolute inset-0 z-0 overflow-hidden",
            isDark && "brightness-[0.42] contrast-[1.05] saturate-[1.12]"
          )}
          aria-hidden
        >
          {Array.from({ length: tiles.count }, (_, index) => {
            const mask = tileMask(index, tiles.count);
            return (
              <div
                key={index}
                className="absolute inset-x-0 w-full"
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

        <AmbientFx particleCount={48} bubbleCount={10} />

        <div className="relative z-[2]">{children}</div>
      </div>
    </MotionProvider>
  );
}
