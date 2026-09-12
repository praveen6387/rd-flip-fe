"use client";

import { useEffect, useRef, useState } from "react";
import { useMobileFlipChrome } from "@/hooks/use-mobile-flip-chrome";
import { isFlipbookExpired } from "@/lib/flipbook-active";
import ClassicFlipEngine from "./_builder/ClassicFlipEngine";
import FlipEngine from "./_builder/FlipEngine";
import FullscreenToggle from "./_builder/FullscreenToggle";
import MuteToggle from "./_builder/MuteToggle";
import ThemeSwitcher from "./_builder/ThemeSwitcher";
import ViewerLandingLoader from "./_builder/ViewerLandingLoader";
import { FlipSoundProvider, useFlipSound } from "./_builder/useFlipSound";
import ViewerSocialLinks from "./_builder/ViewerSocialLinks";
import {
  prepareClassicMedia,
  prepareStudioMedia,
} from "./prepareViewerMedia";

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
  // Default Classic on every visit — never persist theme.
  const [theme, setTheme] = useState("classic");
  const viewerRef = useRef(null);
  const {
    isMobile,
    forceLandscape,
    isFullscreen,
    enterImmersive,
    toggleFullscreen,
  } = useMobileFlipChrome(viewerRef);
  const { startBackgroundSong, stopBackgroundSong } = useFlipSound();

  const [classicMedia, setClassicMedia] = useState(null);
  const [studioMedia, setStudioMedia] = useState(null);
  const [mediaError, setMediaError] = useState("");
  const [loadProgress, setLoadProgress] = useState(0);
  const [studioLoading, setStudioLoading] = useState(false);

  // Classic first — one pass, no Studio network work.
  useEffect(() => {
    let cancelled = false;
    setClassicMedia(null);
    setStudioMedia(null);
    setMediaError("");
    setLoadProgress(0);

    prepareClassicMedia(flipbook.pages, {
      onProgress: (ratio) => {
        if (!cancelled) setLoadProgress(ratio);
      },
    })
      .then((prepared) => {
        if (!cancelled) {
          setLoadProgress(1);
          setClassicMedia(prepared);
        }
      })
      .catch(() => {
        if (!cancelled) setMediaError("Could not load album photos.");
      });

    return () => {
      cancelled = true;
    };
  }, [flipbook.pages]);

  // Studio only when user asks — avoids heavy 3D texture preload on landing.
  useEffect(() => {
    if (theme !== "studio" || studioMedia || !classicMedia) return undefined;

    let cancelled = false;
    setStudioLoading(true);
    setLoadProgress(0);

    prepareStudioMedia(flipbook.pages, {
      onProgress: (ratio) => {
        if (!cancelled) setLoadProgress(ratio);
      },
    })
      .then((prepared) => {
        if (!cancelled) {
          setStudioMedia(prepared);
          setStudioLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMediaError("Could not load Studio view.");
          setStudioLoading(false);
          setTheme("classic");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [theme, studioMedia, classicMedia, flipbook.pages]);

  useEffect(() => {
    startBackgroundSong();

    function unlock() {
      startBackgroundSong();
      enterImmersive();
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
  }, [startBackgroundSong, stopBackgroundSong, enterImmersive]);

  const dateLabel = formatDate(flipbook.date);
  const showLoader =
    !mediaError &&
    (!classicMedia || (theme === "studio" && (studioLoading || !studioMedia)));

  return (
    <main
      ref={viewerRef}
      className={`flip-viewer relative h-dvh text-white${
        theme === "classic" ? " flip-viewer--classic" : " flip-viewer--studio"
      }`}
    >
      <div
        className={`flip-viewer__frame${
          forceLandscape ? " flip-viewer__frame--landscape" : ""
        }`}
      >
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
            {isMobile ? (
              <FullscreenToggle
                active={isFullscreen}
                onToggle={toggleFullscreen}
              />
            ) : null}
            <ThemeSwitcher theme={theme} onChange={setTheme} />
          </div>
        </header>

        <div className="relative z-10 flex min-h-0 flex-1 flex-col px-1 pb-1 sm:px-4 sm:pb-2">
          {mediaError ? (
            <p className="grid flex-1 place-items-center text-sm text-rose-300">
              {mediaError}
            </p>
          ) : showLoader ? (
            <ViewerLandingLoader
              progress={loadProgress}
              studioName={flipbook.studio_name || "RD Flip"}
              title={flipbook.title}
            />
          ) : theme === "studio" && studioMedia ? (
            <FlipEngine
              bookPages={studioMedia.bookPages}
              textureUrls={studioMedia.textureUrls}
              active
              isMobile={isMobile}
              forceLandscape={forceLandscape}
            />
          ) : (
            <ClassicFlipEngine
              imageUrls={classicMedia.classicUrls}
              sheetCount={classicMedia.sheets.length}
              active
              isMobile={isMobile}
              forceLandscape={forceLandscape}
            />
          )}
        </div>
      </div>
    </main>
  );
}

function ExpiredView({ flipbook, error, details }) {
  const dateLabel = formatDate(flipbook?.date);

  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden bg-[#07070a] text-white">
      <header className="relative z-10 grid shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 py-2 sm:gap-3 sm:px-6 sm:py-3">
        <div className="min-w-0">
          <p className="truncate text-[10px] font-medium tracking-[0.18em] text-amber-200/85 uppercase sm:text-[11px] sm:tracking-[0.22em]">
            {flipbook?.studio_name || "RD Flip"}
          </p>
          {flipbook ? <ViewerSocialLinks flipbook={flipbook} /> : null}
        </div>
        <div className="text-center">
          <h1 className="font-heading text-base tracking-tight sm:text-lg md:text-xl">
            {flipbook?.title || "Flipbook"}
          </h1>
          {dateLabel ? (
            <p className="mt-0.5 text-[10px] tracking-[0.12em] text-white/50 uppercase sm:text-[11px] sm:tracking-[0.14em]">
              {dateLabel}
            </p>
          ) : null}
        </div>
        <div />
      </header>

      <div className="relative z-10 grid flex-1 place-items-center px-6 pb-16 text-center">
        <div className="max-w-md rounded-3xl border border-white/10 bg-white/4 px-6 py-8 backdrop-blur-md sm:px-8">
          <p className="text-[11px] font-medium tracking-[0.22em] text-rose-300/90 uppercase">
            Expired
          </p>
          <h2 className="mt-3 font-heading text-2xl tracking-tight sm:text-3xl">
            {error || "This flipbook has expired."}
          </h2>
          <p className="mt-3 text-[15px] leading-7 text-white/65">
            {details ||
              "This flipbook is no longer available. Ask the studio to recharge it."}
          </p>
        </div>
      </div>
    </main>
  );
}

function NotFoundView({ error, details }) {
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
        {details && details !== error ? (
          <p className="mt-1 text-sm text-white/45">{details}</p>
        ) : null}
      </div>
    </main>
  );
}

export default function FlipbookView({
  flipbook,
  error,
  details,
  expired = false,
}) {
  const isExpired =
    expired || (flipbook ? isFlipbookExpired(flipbook.active_until) : false);

  if (!flipbook) {
    return <NotFoundView error={error} details={details} />;
  }

  if (isExpired) {
    return (
      <ExpiredView
        flipbook={flipbook}
        error={error || "This flipbook has expired."}
        details={details}
      />
    );
  }

  return (
    <FlipSoundProvider>
      <FlipbookViewInner flipbook={flipbook} />
    </FlipSoundProvider>
  );
}
