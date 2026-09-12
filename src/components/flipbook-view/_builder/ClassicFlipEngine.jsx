"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useFlipSound } from "./useFlipSound";

const PAGE_RATIO = 7 / 5;
const ZOOM_MIN = 0.88; // one step smaller than default fill view
const ZOOM_MAX = 1.55;
const ZOOM_STEP = 0.12;
const PAGE_FILL = 0.99;

function measurePage(stage, fill = 0.96, inset = 8) {
  const maxW = Math.max((stage?.clientWidth || 0) - inset, 120);
  const maxH = Math.max((stage?.clientHeight || 0) - inset, 160);

  let pageWidth = maxW / 2;
  let pageHeight = pageWidth / PAGE_RATIO;

  if (pageHeight > maxH) {
    pageHeight = maxH;
    pageWidth = pageHeight * PAGE_RATIO;
  }

  pageWidth = Math.floor(pageWidth * fill);
  pageHeight = Math.floor(pageHeight * fill);

  return {
    pageWidth: Math.max(100, pageWidth),
    pageHeight: Math.max(140, pageHeight),
  };
}

function applyCoverClip(bookEl, mode, renderPageWidth, dpr = 1) {
  if (!bookEl) return;
  const shift = Math.max(1, Math.round(renderPageWidth / 2));
  const scale = dpr > 1 ? `scale(${1 / dpr})` : "";

  if (mode === "front") {
    bookEl.style.clipPath = "inset(0 0 0 50%)";
    bookEl.style.transform = [scale, `translateX(-${shift}px)`]
      .filter(Boolean)
      .join(" ");
  } else if (mode === "back") {
    bookEl.style.clipPath = "inset(0 50% 0 0)";
    bookEl.style.transform = [scale, `translateX(${shift}px)`]
      .filter(Boolean)
      .join(" ");
  } else {
    bookEl.style.clipPath = "";
    bookEl.style.transform = scale;
  }
}

function renderScale(dpr) {
  return dpr > 1 ? `scale(${1 / dpr})` : "";
}

function isPageFlipWhite(style) {
  const s = String(style || "")
    .toLowerCase()
    .replace(/\s+/g, "");
  return (
    s === "white" ||
    s === "#fff" ||
    s === "#ffffff" ||
    s === "rgb(255,255,255)" ||
    s === "rgba(255,255,255,1)"
  );
}

/** Skip page-flip's solid white canvas clear so empty halves stay transparent. */
function patchTransparentClear(bookEl) {
  const canvas = bookEl?.querySelector("canvas");
  const ctx = canvas?.getContext?.("2d");
  if (!ctx || ctx.__rdFlipClearPatched) return;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  const fillRect = ctx.fillRect.bind(ctx);
  ctx.fillRect = (x, y, w, h) => {
    if (isPageFlipWhite(ctx.fillStyle)) {
      ctx.clearRect(x, y, w, h);
      return;
    }
    fillRect(x, y, w, h);
  };
  ctx.__rdFlipClearPatched = true;
}

function flipNext(api, mode) {
  if (mode === "back") return;
  api?.flipNext("top");
}

function flipPrev(api, mode) {
  if (mode === "front") return;
  api?.flipPrev("top");
}

function goToStart(api) {
  if (!api) return;
  try {
    api.turnToPage(0);
  } catch {
    /* ignore */
  }
}

function goToEnd(api) {
  if (!api) return;
  try {
    const count = api.getPageCount?.() ?? 0;
    if (count > 0) api.turnToPage(count - 1);
  } catch {
    /* ignore */
  }
}

function ControlButton({ label, disabled, onClick, children }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      className="flip-control-btn"
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

  useEffect(() => {
    coverModeRef.current = coverMode;
  }, [coverMode]);

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

    function applyFlip(goNext) {
      const mode = coverModeRef.current;
      if (goNext) flipNext(flipRef.current, mode);
      else flipPrev(flipRef.current, mode);
    }

    function tapSide(clientX, clientY) {
      const book = bookRef.current || stage.querySelector(".stf__parent");
      if (!book) return;
      const rect = book.getBoundingClientRect();
      if (rect.width < 8 || rect.height < 8) return;

      if (forceLandscapeRef.current) {
        applyFlip(clientY < rect.top + rect.height / 2);
        return;
      }
      applyFlip(clientX - rect.left >= rect.width / 2);
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

      // Tap only — no drag / swipe flip
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

      const { pageWidth, pageHeight } = measurePage(stage, PAGE_FILL, 8);
      if (pageWidth < 80 || pageHeight < 80) {
        if (!cancelled) setLoading(false);
        return;
      }
      pageSizeRef.current = { w: pageWidth, h: pageHeight };

      const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 2 : 2.5);
      const renderW = Math.max(1, Math.round(pageWidth * dpr));
      const renderH = Math.max(1, Math.round(pageHeight * dpr));

      const shell = document.createElement("div");
      shell.className = "classic-flip-shell";
      shell.style.width = `${pageWidth * 2}px`;
      shell.style.height = `${pageHeight}px`;
      shell.style.display = "flex";
      shell.style.alignItems = "center";
      shell.style.justifyContent = "center";

      const book = document.createElement("div");
      book.className = "classic-flip-book";
      book.style.transformOrigin = "center center";
      book.style.transform = renderScale(dpr);
      shell.appendChild(book);
      stage.appendChild(shell);
      bookRef.current = book;

      pageFlip = new PageFlip(book, {
        width: renderW,
        height: renderH,
        size: "fixed",
        showCover: true,
        usePortrait: false,
        autoSize: false,
        drawShadow: !isMobile,
        maxShadowOpacity: 0.35,
        flippingTime: 750,
        startZIndex: 10000,
        mobileScrollSupport: false,
        swipeDistance: 99999,
        disableFlipByClick: true,
        useMouseEvents: false,
        showPageCorners: false,
        startPage: Math.min(pageRef.current, Math.max(imageUrls.length - 1, 0)),
      });

      pageFlip.loadFromImages(imageUrls);
      patchTransparentClear(book);

      if (pageRef.current === 0) {
        applyCoverClip(book, "front", renderW, dpr);
      }

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
        applyCoverClip(book, mode, renderW, dpr);
        setSpread({ current: spreadIndex + 1, total: totalSpreads });
        setCoverMode(mode);
      };

      pageFlip.on("init", () => {
        syncSpread();
        if (!cancelled) setLoading(false);
      });
      pageFlip.on("flip", (event) => {
        syncSpread(event.data);
        if (activeRef.current) playFlipSoundRef.current();
      });
      pageFlip.on("changeState", (event) => {
        const state = event?.data;
        if (state === "flipping" || state === "user_fold") {
          book.style.clipPath = "";
          book.style.transform = renderScale(dpr);
          return;
        }
        if (state === "read") {
          applyCoverClip(book, coverModeRef.current, renderW, dpr);
        }
      });

      flipRef.current = pageFlip;
    }

    mount();

    const observer = new ResizeObserver(() => {
      if (!activeRef.current || !bookRef.current) return;
      const next = measurePage(stage, PAGE_FILL, 8);
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
      if (event.key === "ArrowRight") {
        flipNext(flipRef.current, coverModeRef.current);
      }
      if (event.key === "ArrowLeft") {
        flipPrev(flipRef.current, coverModeRef.current);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  if (!sheetCount) {
    return (
      <p className="text-sm text-white/60">This album has no pages yet.</p>
    );
  }

  const atStart = coverMode === "front";
  const atEnd = coverMode === "back";
  const busy = loading;

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      {loading ? (
        <div className="pointer-events-none absolute inset-0 z-20 grid place-items-center">
          <div className="flex flex-col items-center gap-3">
            <span className="size-9 animate-spin rounded-full border-2 border-amber-200/25 border-t-amber-300" />
            <p className="text-sm text-amber-100/80">Opening album…</p>
          </div>
        </div>
      ) : null}

      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        <div
          className="flip-zoom-layer absolute inset-0 flex items-center justify-center"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: "center center",
            transition: "transform 180ms ease-out",
            willChange: "transform",
          }}
        >
          <div
            ref={stageRef}
            className={`flip-stage classic-flip-stage h-full w-full min-h-0 ${
              coverMode === "front"
                ? "is-front-cover"
                : coverMode === "back"
                  ? "is-back-cover"
                  : ""
            }${loading ? " opacity-0" : " opacity-100"}`}
          />
        </div>
      </div>

      <div className="flipbook-controls" aria-label="Album controls">
        <div className="flipbook-controls__primary">
          <ControlButton
            label="First page"
            disabled={busy || atStart}
            onClick={() => goToStart(flipRef.current)}
          >
            <ChevronFirst className="size-[1.15em]" />
          </ControlButton>
          <ControlButton
            label="Previous page"
            disabled={busy || atStart}
            onClick={() => flipPrev(flipRef.current, coverModeRef.current)}
          >
            <ChevronLeft className="size-[1.15em]" />
          </ControlButton>
          <p className="flipbook-controls__page" aria-live="polite">
            {spread.current} / {spread.total}
          </p>
          <ControlButton
            label="Next page"
            disabled={busy || atEnd}
            onClick={() => flipNext(flipRef.current, coverModeRef.current)}
          >
            <ChevronRight className="size-[1.15em]" />
          </ControlButton>
          <ControlButton
            label="Last page"
            disabled={busy || atEnd}
            onClick={() => goToEnd(flipRef.current)}
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
      </div>
    </div>
  );
}
