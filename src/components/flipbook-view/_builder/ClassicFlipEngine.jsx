"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  Volume2,
  VolumeX,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useFlipSound } from "./useFlipSound";
import ViewerThemePicker from "./ViewerThemePicker";

/** Album page: 12×18 (H×W); open spread: 12×36. PAGE_RATIO = width / height. */
const PAGE_RATIO = 18 / 12;
const ZOOM_MIN = 0.88;
const ZOOM_MAX = 1.55;
const ZOOM_STEP = 0.12;
const PAGE_FILL = 0.99;
const FLIP_MS = 750;
/** Keep in sync with flip so cover shift and page turn run together. */
const COVER_SHIFT_MS = FLIP_MS;
const AUTOPLAY_MS = 3200;

function measurePage(stage) {
  const maxW = Math.max((stage?.clientWidth || 0) - 8, 120);
  const maxH = Math.max((stage?.clientHeight || 0) - 8, 160);

  let pageWidth = maxW / 2;
  let pageHeight = pageWidth / PAGE_RATIO;

  if (pageHeight > maxH) {
    pageHeight = maxH;
    pageWidth = pageHeight * PAGE_RATIO;
  }

  return {
    pageWidth: Math.max(100, Math.floor(pageWidth * PAGE_FILL)),
    pageHeight: Math.max(140, Math.floor(pageHeight * PAGE_FILL)),
  };
}

function buildHardPages(imageUrls) {
  return (imageUrls || []).map((src, index) => {
    const page = document.createElement("div");
    page.className = "classic-flip-page";
    page.dataset.density = "hard";

    const img = document.createElement("img");
    img.src = src;
    img.alt = `Page ${index + 1}`;
    img.draggable = false;
    page.appendChild(img);

    return page;
  });
}

function coverShift(mode, pageWidth) {
  const shift = Math.round(pageWidth / 2);
  if (mode === "front") return `translateX(-${shift}px)`;
  if (mode === "back") return `translateX(${shift}px)`;
  return "";
}

function ControlButton({ label, disabled, onClick, children, highlight = false, pressed }) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      disabled={disabled}
      className={`flip-control-btn${highlight ? " flip-control-btn--highlight" : ""}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default function ClassicFlipEngine({
  imageUrls,
  sheetCount,
  active = true,
  isMobile = false,
  forceLandscape = false,
  isFullscreen = false,
  onToggleFullscreen,
  themeId,
  onThemeChange,
}) {
  const stageRef = useRef(null);
  const bookRef = useRef(null);
  const flipRef = useRef(null);
  const pageRef = useRef(0);
  const pageSizeRef = useRef({ w: 0, h: 0 });
  const coverModeRef = useRef("front");
  const activeRef = useRef(active);
  const forceLandscapeRef = useRef(forceLandscape);
  const { muted, toggleMute, playFlipSound } = useFlipSound();
  const playFlipSoundRef = useRef(playFlipSound);
  const [spread, setSpread] = useState({ current: 1, total: 1 });
  const [coverMode, setCoverMode] = useState("front");
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [autoPlay, setAutoPlay] = useState(false);
  const autoPlayRef = useRef(false);

  useEffect(() => {
    coverModeRef.current = coverMode;
  }, [coverMode]);

  useEffect(() => {
    autoPlayRef.current = autoPlay;
  }, [autoPlay]);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    forceLandscapeRef.current = forceLandscape;
  }, [forceLandscape]);

  useEffect(() => {
    playFlipSoundRef.current = playFlipSound;
  }, [playFlipSound]);

  useEffect(() => {
    if (!active || loading) return undefined;
    const stage = stageRef.current;
    if (!stage) return undefined;

    let touchStart = null;
    let touchHandled = false;

    function flip(goNext, corner = "top") {
      const api = flipRef.current;
      const mode = coverModeRef.current;
      if (!api) return;
      if (goNext && mode !== "back") api.flipNext(corner);
      if (!goNext && mode !== "front") api.flipPrev(corner);
    }

    function tapSide(clientX, clientY) {
      const book = bookRef.current || stage.querySelector(".stf__parent");
      if (!book) return;
      const rect = book.getBoundingClientRect();
      if (rect.width < 8 || rect.height < 8) return;

      if (forceLandscapeRef.current) {
        // Frame is CSS-rotated 90deg — visual top/bottom map opposite to page-flip.
        const tapTop = clientY < rect.top + rect.height / 2;
        flip(!tapTop, tapTop ? "bottom" : "top");
        return;
      }
      const tapRight = clientX - rect.left >= rect.width / 2;
      flip(tapRight, "top");
    }

    function onTouchStart(event) {
      const touch = event.touches[0];
      if (!touch) return;
      touchStart = { x: touch.clientX, y: touch.clientY, time: Date.now() };
    }

    function onTouchEnd(event) {
      const touch = event.changedTouches[0];
      if (!touch || !touchStart) return;

      const dx = touch.clientX - touchStart.x;
      const dy = touch.clientY - touchStart.y;
      const elapsed = Date.now() - touchStart.time;
      touchStart = null;
      if (elapsed > 450) return;

      if (Math.abs(dx) < 36 && Math.abs(dy) < 36) {
        event.preventDefault();
        touchHandled = true;
        window.setTimeout(() => {
          touchHandled = false;
        }, 400);
        tapSide(touch.clientX, touch.clientY);
      }
    }

    function onClick(event) {
      if (touchHandled) return;
      if (event.target?.closest?.("button")) return;
      tapSide(event.clientX, event.clientY);
    }

    stage.addEventListener("touchstart", onTouchStart, { passive: true });
    stage.addEventListener("touchend", onTouchEnd, { passive: false });
    stage.addEventListener("click", onClick);

    return () => {
      stage.removeEventListener("touchstart", onTouchStart);
      stage.removeEventListener("touchend", onTouchEnd);
      stage.removeEventListener("click", onClick);
    };
  }, [active, loading]);

  useEffect(() => {
    if (!active) return undefined;

    const stage = stageRef.current;
    if (!stage || !imageUrls?.length) {
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    let pageFlip = null;
    let resizeTimer = 0;

    async function mount() {
      setLoading(true);

      const { PageFlip } = await import("page-flip/dist/js/page-flip.module.js");
      if (cancelled || !stageRef.current) return;

      try {
        pageFlip?.destroy();
      } catch {
        /* gone */
      }
      pageFlip = null;
      stage.innerHTML = "";

      const { pageWidth, pageHeight } = measurePage(stage);
      if (pageWidth < 80 || pageHeight < 80) {
        if (!cancelled) setLoading(false);
        return;
      }
      pageSizeRef.current = { w: pageWidth, h: pageHeight };

      const shell = document.createElement("div");
      shell.className = "classic-flip-shell";
      shell.style.width = `${pageWidth * 2}px`;
      shell.style.height = `${pageHeight}px`;
      shell.style.transition = `transform ${COVER_SHIFT_MS}ms ease-in-out`;

      const book = document.createElement("div");
      book.className = "classic-flip-book";
      shell.appendChild(book);
      stage.appendChild(shell);
      bookRef.current = book;

      pageFlip = new PageFlip(book, {
        width: pageWidth,
        height: pageHeight,
        size: "fixed",
        showCover: true,
        usePortrait: false,
        autoSize: false,
        drawShadow: !isMobile,
        maxShadowOpacity: 0.35,
        flippingTime: FLIP_MS,
        startZIndex: 10000,
        mobileScrollSupport: false,
        swipeDistance: 99999,
        disableFlipByClick: true,
        useMouseEvents: false,
        showPageCorners: false,
        startPage: Math.min(pageRef.current, Math.max(imageUrls.length - 1, 0)),
      });

      pageFlip.loadFromHTML(buildHardPages(imageUrls));

      const syncSpread = (index) => {
        const collection = pageFlip.getPageCollection();
        const current =
          typeof index === "number" ? index : collection.getCurrentPageIndex();
        const spreadIndex = collection.getCurrentSpreadIndex();
        const totalSpreads = collection.getSpread().length;
        pageRef.current = current;

        let mode = "open";
        if (spreadIndex === 0) mode = "front";
        else if (spreadIndex === totalSpreads - 1) mode = "back";

        coverModeRef.current = mode;
        shell.style.transform = coverShift(mode, pageWidth);
        setSpread({ current: spreadIndex + 1, total: totalSpreads });
        setCoverMode(mode);
      };

      pageFlip.on("init", () => {
        // No animation on first paint.
        shell.style.transition = "none";
        syncSpread();
        requestAnimationFrame(() => {
          shell.style.transition = `transform ${COVER_SHIFT_MS}ms ease-in-out`;
        });
        if (!cancelled) setLoading(false);
      });

      pageFlip.on("flip", (event) => {
        syncSpread(event.data);
        if (activeRef.current) playFlipSoundRef.current();
      });

      pageFlip.on("changeState", (event) => {
        const state = event?.data;
        if (state !== "flipping" && state !== "user_fold" && state !== "read") {
          return;
        }

        shell.style.transition = `transform ${COVER_SHIFT_MS}ms ease-in-out`;

        if (state === "read") {
          shell.style.transform = coverShift(coverModeRef.current, pageWidth);
          return;
        }

        // Flip + shift together (same as open).
        const mode = coverModeRef.current;
        const collection = pageFlip.getPageCollection();
        const spreadIndex = collection.getCurrentSpreadIndex();
        const totalSpreads = collection.getSpread().length;
        // 0 = forward (next), 1 = back (prev)
        const direction = pageFlip.getRender()?.getDirection?.();

        if (mode === "front" || mode === "back") {
          // Opening cover → slide toward spine while turning.
          shell.style.transform = "";
        } else if (direction === 1 && spreadIndex === 1) {
          // Closing to front → slide toward center while turning.
          shell.style.transform = coverShift("front", pageWidth);
        } else if (direction === 0 && spreadIndex === totalSpreads - 2) {
          // Closing to back → slide toward center while turning.
          shell.style.transform = coverShift("back", pageWidth);
        } else {
          shell.style.transform = "";
        }
      });

      flipRef.current = pageFlip;
    }

    mount();

    const observer = new ResizeObserver(() => {
      if (!activeRef.current || !bookRef.current) return;
      const next = measurePage(stage);
      const prev = pageSizeRef.current;
      if (
        Math.abs(next.pageWidth - prev.w) < 16 &&
        Math.abs(next.pageHeight - prev.h) < 16
      ) {
        return;
      }
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        if (!cancelled) mount();
      }, 220);
    });
    observer.observe(stage);

    return () => {
      cancelled = true;
      observer.disconnect();
      window.clearTimeout(resizeTimer);
      try {
        pageFlip?.destroy();
      } catch {
        /* gone */
      }
      flipRef.current = null;
      bookRef.current = null;
      if (stageRef.current) stageRef.current.innerHTML = "";
    };
  }, [active, imageUrls, isMobile]);

  useEffect(() => {
    if (!active) return undefined;

    function onKey(event) {
      const api = flipRef.current;
      const mode = coverModeRef.current;
      if (!api) return;
      if (event.key === "ArrowRight" && mode !== "back") api.flipNext("top");
      if (event.key === "ArrowLeft" && mode !== "front") api.flipPrev("top");
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  useEffect(() => {
    if (!autoPlay || !active || loading) return undefined;

    const timer = window.setInterval(() => {
      const book = flipRef.current;
      if (!book || !autoPlayRef.current) return;

      if (coverModeRef.current === "back") {
        book.turnToPage(0);
        return;
      }

      try {
        book.flipNext("top");
      } catch {
        /* ignore mid-flip */
      }
    }, AUTOPLAY_MS);

    return () => window.clearInterval(timer);
  }, [autoPlay, active, loading]);

  if (!sheetCount) {
    return (
      <p className="text-sm text-white/60">This album has no pages yet.</p>
    );
  }

  const atStart = coverMode === "front";
  const atEnd = coverMode === "back";
  const busy = loading;
  const api = () => flipRef.current;

  return (
    <div className="relative flex h-full min-h-0 w-full flex-1 flex-col">
      {loading ? (
        <div className="pointer-events-none absolute inset-0 z-20 grid place-items-center">
          <div className="flex flex-col items-center gap-3">
            <span className="size-9 animate-spin rounded-full border-2 border-amber-200/25 border-t-amber-300" />
            <p className="text-sm text-amber-100/80">Opening album…</p>
          </div>
        </div>
      ) : null}

      <div className="relative grid min-h-0 flex-1 place-items-center overflow-hidden">
        <div
          className="flip-zoom-layer absolute inset-0 flex items-center justify-center"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: "center center",
            transition: "transform 180ms ease-out",
          }}
        >
          <div
            ref={stageRef}
            className={`flip-stage classic-flip-stage h-full w-full min-h-0${
              loading ? " opacity-0" : " opacity-100"
            }`}
          />
        </div>
      </div>

      <div className="flipbook-controls" aria-label="Album controls">
        <div className="flipbook-controls__zoom flipbook-controls__zoom--left">
          <ControlButton
            label="Zoom out"
            disabled={busy || zoom <= ZOOM_MIN}
            onClick={() =>
              setZoom((z) => Math.max(ZOOM_MIN, Number((z - ZOOM_STEP).toFixed(2))))
            }
          >
            <ZoomOut className="size-[1.05em]" />
          </ControlButton>
          <ControlButton
            label="Zoom in"
            disabled={busy || zoom >= ZOOM_MAX}
            onClick={() =>
              setZoom((z) => Math.min(ZOOM_MAX, Number((z + ZOOM_STEP).toFixed(2))))
            }
          >
            <ZoomIn className="size-[1.05em]" />
          </ControlButton>
        </div>

        <div className="flipbook-controls__primary">
          <ControlButton
            label={autoPlay ? "Pause auto flip" : "Play auto flip"}
            disabled={busy}
            highlight
            pressed={autoPlay}
            onClick={() => setAutoPlay((value) => !value)}
          >
            {autoPlay ? (
              <Pause className="size-[1.05em]" />
            ) : (
              <Play className="size-[1.05em]" />
            )}
          </ControlButton>
          <ControlButton
            label="First page"
            disabled={busy || atStart}
            onClick={() => {
              setAutoPlay(false);
              api()?.turnToPage(0);
            }}
          >
            <ChevronFirst className="size-[1.15em]" />
          </ControlButton>
          <ControlButton
            label="Previous page"
            disabled={busy || atStart}
            onClick={() => {
              setAutoPlay(false);
              api()?.flipPrev("top");
            }}
          >
            <ChevronLeft className="size-[1.15em]" />
          </ControlButton>
          <p className="flipbook-controls__page" aria-live="polite">
            {spread.current} / {spread.total}
          </p>
          <ControlButton
            label="Next page"
            disabled={busy || atEnd}
            onClick={() => {
              setAutoPlay(false);
              api()?.flipNext("top");
            }}
          >
            <ChevronRight className="size-[1.15em]" />
          </ControlButton>
          <ControlButton
            label="Last page"
            disabled={busy || atEnd}
            onClick={() => {
              setAutoPlay(false);
              const count = api()?.getPageCount?.() ?? 0;
              if (count > 0) api()?.turnToPage(count - 1);
            }}
          >
            <ChevronLast className="size-[1.15em]" />
          </ControlButton>
          <ControlButton
            label={muted ? "Unmute music" : "Mute music"}
            disabled={busy}
            onClick={toggleMute}
          >
            {muted ? (
              <VolumeX className="size-[1.05em]" />
            ) : (
              <Volume2 className="size-[1.05em]" />
            )}
          </ControlButton>
        </div>

        <div className="flipbook-controls__zoom">
          {typeof onThemeChange === "function" ? (
            <ViewerThemePicker themeId={themeId} onChange={onThemeChange} />
          ) : null}
          {typeof onToggleFullscreen === "function" ? (
            <ControlButton
              label={isFullscreen ? "Exit full view" : "Full view"}
              disabled={busy}
              onClick={onToggleFullscreen}
            >
              {isFullscreen ? (
                <Minimize2 className="size-[1.05em]" />
              ) : (
                <Maximize2 className="size-[1.05em]" />
              )}
            </ControlButton>
          ) : null}
        </div>
      </div>
    </div>
  );
}
