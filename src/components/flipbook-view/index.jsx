"use client";

import { useEffect, useState } from "react";
import Particles from "@/components/landing/_builder/Background/_builder/Particles";
import ClassicFlipEngine from "./_builder/ClassicFlipEngine";
import FlipEngine from "./_builder/FlipEngine";
import MuteToggle from "./_builder/MuteToggle";
import ThemeSwitcher from "./_builder/ThemeSwitcher";
import { FlipSoundProvider, useFlipSound } from "./_builder/useFlipSound";
import ViewerSocialLinks from "./_builder/ViewerSocialLinks";

const STAR_COLORS = [
  "rgba(253, 230, 138,",
  "rgba(250, 250, 249,",
  "rgba(252, 211, 77,",
];

const THEME_KEY = "rd-flip-viewer-theme";

function useViewerTheme() {
  const [theme, setTheme] = useState("studio");

  useEffect(() => {
    const stored = window.localStorage.getItem(THEME_KEY);
    if (stored === "studio" || stored === "classic") {
      setTheme(stored);
    }
  }, []);

  function changeTheme(next) {
    setTheme(next);
    window.localStorage.setItem(THEME_KEY, next);
  }

  return [theme, changeTheme];
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function FlipbookViewInner({ flipbook }) {
  const [theme, setTheme] = useViewerTheme();
  const [mounted, setMounted] = useState({ studio: true, classic: false });
  const { startBackgroundSong, stopBackgroundSong } = useFlipSound();

  useEffect(() => {
    setMounted((current) =>
      current[theme] ? current : { ...current, [theme]: true }
    );
  }, [theme]);

  useEffect(() => {
    startBackgroundSong();

    function unlock() {
      startBackgroundSong();
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchstart", unlock);
    }

    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    window.addEventListener("touchstart", unlock, { once: true });

    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchstart", unlock);
      stopBackgroundSong();
    };
  }, [startBackgroundSong, stopBackgroundSong]);

  const dateLabel = formatDate(flipbook.date);

  return (
    <main
      className={`flip-viewer relative flex h-dvh flex-col overflow-hidden bg-[#07070a] text-white${
        theme === "classic" ? " flip-viewer--classic" : " flip-viewer--studio"
      }`}
    >
      <div className="pointer-events-none absolute inset-0">
        <Particles colors={STAR_COLORS} density={16000} />
      </div>

      <header className="relative z-10 grid shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 py-2 sm:gap-3 sm:px-6 sm:py-3">
        <div className="min-w-0">
          <p className="truncate text-[10px] font-medium tracking-[0.18em] text-amber-200/85 uppercase sm:text-[11px] sm:tracking-[0.22em]">
            {flipbook.studio_name || "RD Flip"}
          </p>
          <ViewerSocialLinks flipbook={flipbook} />
        </div>
        <div className="text-center">
          <h1 className="font-heading text-base tracking-tight sm:text-lg md:text-xl">
            {flipbook.title}
          </h1>
          {dateLabel ? (
            <p className="mt-0.5 text-[10px] tracking-[0.12em] text-white/50 uppercase sm:text-[11px] sm:tracking-[0.14em]">
              {dateLabel}
            </p>
          ) : null}
        </div>
        <div className="flex items-center justify-end gap-1.5 sm:gap-2">
          <MuteToggle />
          <ThemeSwitcher theme={theme} onChange={setTheme} />
        </div>
      </header>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col px-1 pb-1 sm:px-4 sm:pb-2">
        {mounted.studio ? (
          <div
            className={
              theme === "studio"
                ? "flex min-h-0 flex-1 flex-col"
                : "pointer-events-none invisible absolute inset-0"
            }
            aria-hidden={theme !== "studio"}
          >
            <FlipEngine pages={flipbook.pages} active={theme === "studio"} />
          </div>
        ) : null}

        {mounted.classic ? (
          <div
            className={
              theme === "classic"
                ? "flex min-h-0 flex-1 flex-col"
                : "pointer-events-none invisible absolute inset-0"
            }
            aria-hidden={theme !== "classic"}
          >
            <ClassicFlipEngine
              pages={flipbook.pages}
              active={theme === "classic"}
            />
          </div>
        ) : null}
      </div>
    </main>
  );
}

export default function FlipbookView({ flipbook, error }) {
  if (error || !flipbook) {
    return (
      <main className="grid min-h-dvh place-items-center bg-[#07070a] px-6 text-center text-white">
        <div>
          <p className="text-[11px] font-medium tracking-[0.22em] text-amber-200/80 uppercase">
            RD Flip
          </p>
          <h1 className="mt-3 font-heading text-2xl tracking-tight">
            Flipbook not found
          </h1>
          <p className="mt-2 text-sm text-white/60">
            {error || "This album is unavailable."}
          </p>
        </div>
      </main>
    );
  }

  return (
    <FlipSoundProvider>
      <FlipbookViewInner flipbook={flipbook} />
    </FlipSoundProvider>
  );
}
