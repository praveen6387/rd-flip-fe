"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useFlipSound } from "./useFlipSound";

const PAGE_RATIO = 7 / 5;

function measurePage(stage, fill = 0.96) {
  const maxW = Math.max((stage?.clientWidth || 0) - 8, 120);
  const maxH = Math.max((stage?.clientHeight || 0) - 8, 160);

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

function patchTransparentClear(bookEl) {
  const canvas = bookEl?.querySelector("canvas");
  const ctx = canvas?.getContext?.("2d");
  if (!ctx || ctx.__rdFlipClearPatched) return;

  const fillRect = ctx.fillRect.bind(ctx);
  ctx.fillRect = (x, y, w, h) => {
    const style = String(ctx.fillStyle || "").toLowerCase();
    if (
      style === "white" ||
      style === "#fff" ||
      style === "#ffffff" ||
      style === "rgb(255, 255, 255)"
    ) {
      ctx.clearRect(x, y, w, h);
      return;
    }
    fillRect(x, y, w, h);
  };
  ctx.__rdFlipClearPatched = true;
}

function applyCoverClip(bookEl, mode, pageWidth) {
  if (!bookEl) return;
  const shift = Math.max(1, Math.round(pageWidth / 2));

  if (mode === "front") {
    bookEl.style.clipPath = "inset(0 0 0 50%)";
    bookEl.style.transform = `translateX(-${shift}px)`;
  } else if (mode === "back") {
    bookEl.style.clipPath = "inset(0 50% 0 0)";
    bookEl.style.transform = `translateX(${shift}px)`;
  } else {
    bookEl.style.clipPath = "";
    bookEl.style.transform = "";
  }
}

function flipNext(api, mode) {
  if (mode === "back") return;
  api?.flipNext("top");
}

function flipPrev(api, mode) {
  if (mode === "front") return;
  api?.flipPrev("top");
}

export default function ClassicFlipEngine({
  imageUrls,
  sheetCount,
  active = true,
  isMobile = false,
  forceLandscape = false,
}) {
  const stageRef = useRef(null);
  const bookRef = useRef(null);
  const flipRef = useRef(null);
  const pageRef = useRef(0);
  const pageSizeRef = useRef({ w: 0, h: 0 });
  const coverModeRef = useRef("front");
  const activeRef = useRef(active);
  const forceLandscapeRef = useRef(forceLandscape);
  const { playFlipSound } = useFlipSound();
  const playFlipSoundRef = useRef(playFlipSound);
  const [spread, setSpread] = useState({ current: 1, total: 1 });
  const [coverMode, setCoverMode] = useState("front");
  const [loading, setLoading] = useState(true);

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

      // Left side → previous (page turns left→right)
      // Right side → next (page turns right→left)
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

      if (Math.abs(dx) < 36 && Math.abs(dy) < 36) {
        event.preventDefault();
        touchHandled = true;
        window.setTimeout(() => {
          touchHandled = false;
        }, 400);
        tapSide(touch.clientX, touch.clientY);
        return;
      }

      const localDx = forceLandscapeRef.current ? dy : dx;
      const localDy = forceLandscapeRef.current ? -dx : dy;

      if (Math.abs(localDx) > Math.abs(localDy) && Math.abs(localDx) > 40) {
        event.preventDefault();
        touchHandled = true;
        window.setTimeout(() => {
          touchHandled = false;
        }, 400);
        applyFlip(localDx < 0);
      }
    }

    function onClick(event) {
      if (touchHandled) return;
      // Ignore clicks on the side nav buttons
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

      const { pageWidth, pageHeight } = measurePage(stage, isMobile ? 0.98 : 0.94);
      if (pageWidth < 80 || pageHeight < 80) {
        if (!cancelled) setLoading(false);
        return;
      }
      pageSizeRef.current = { w: pageWidth, h: pageHeight };

      const book = document.createElement("div");
      book.className = "classic-flip-book";
      stage.appendChild(book);
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
        flippingTime: isMobile ? 420 : 600,
        startZIndex: 10000,
        mobileScrollSupport: false,
        swipeDistance: 24,
        disableFlipByClick: true,
        useMouseEvents: !isMobile,
        startPage: Math.min(pageRef.current, Math.max(imageUrls.length - 1, 0)),
      });

      pageFlip.loadFromImages(imageUrls);
      patchTransparentClear(book);

      if (pageRef.current === 0) {
        applyCoverClip(book, "front", pageWidth);
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
        applyCoverClip(book, mode, pageWidth);
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
          book.style.transform = "";
          return;
        }
        if (state === "read") {
          applyCoverClip(book, coverModeRef.current, pageWidth);
        }
      });

      flipRef.current = pageFlip;
    }

    mount();

    const observer = new ResizeObserver(() => {
      if (!activeRef.current || !bookRef.current) return;
      const next = measurePage(stage, isMobile ? 0.98 : 0.94);
      const prev = pageSizeRef.current;
      if (
        Math.abs(next.pageWidth - prev.w) < 24 &&
        Math.abs(next.pageHeight - prev.h) < 24
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

      <div className="relative flex min-h-0 flex-1">
        {isMobile ? (
          <button
            type="button"
            aria-label="Previous page"
            disabled={loading || atStart}
            className="absolute top-1/2 left-1 z-30 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-amber-200/35 bg-black/45 text-amber-100 backdrop-blur-sm transition active:scale-95 disabled:opacity-30"
            onClick={() => flipPrev(flipRef.current, coverModeRef.current)}
          >
            <ChevronLeft className="size-6" />
          </button>
        ) : null}

        <div
          ref={stageRef}
          className={`flip-stage classic-flip-stage min-h-0 flex-1 ${
            coverMode === "front"
              ? "is-front-cover"
              : coverMode === "back"
                ? "is-back-cover"
                : ""
          }${loading ? " opacity-0" : " opacity-100"}`}
        />

        {isMobile ? (
          <button
            type="button"
            aria-label="Next page"
            disabled={loading || atEnd}
            className="absolute top-1/2 right-1 z-30 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-amber-200/35 bg-black/45 text-amber-100 backdrop-blur-sm transition active:scale-95 disabled:opacity-30"
            onClick={() => flipNext(flipRef.current, coverModeRef.current)}
          >
            <ChevronRight className="size-6" />
          </button>
        ) : null}
      </div>

      {isMobile ? (
        <p className="shrink-0 py-2 text-center text-[11px] tracking-[0.18em] text-amber-100/75 uppercase">
          {spread.current} / {spread.total}
        </p>
      ) : (
        <div className="flex shrink-0 items-center justify-center gap-4 py-3">
          <button
            type="button"
            aria-label="Previous page"
            disabled={loading || atStart}
            className="grid size-9 place-items-center rounded-full border border-amber-200/40 text-amber-100 transition hover:bg-white/10 disabled:opacity-40"
            onClick={() => flipPrev(flipRef.current, coverModeRef.current)}
          >
            <ChevronLeft className="size-5" />
          </button>
          <p className="min-w-16 text-center text-xs tracking-[0.18em] text-amber-100/80 uppercase">
            {spread.current} / {spread.total}
          </p>
          <button
            type="button"
            aria-label="Next page"
            disabled={loading || atEnd}
            className="grid size-9 place-items-center rounded-full border border-amber-200/40 text-amber-100 transition hover:bg-white/10 disabled:opacity-40"
            onClick={() => flipNext(flipRef.current, coverModeRef.current)}
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      )}
    </div>
  );
}
