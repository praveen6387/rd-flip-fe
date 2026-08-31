"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { s3DisplaySrc } from "@/lib/s3/media";
import { buildFlipSheets } from "../buildSheets";
import { useFlipSound } from "./useFlipSound";

const PAGE_RATIO = 7 / 5;
const MAX_HEIGHT_RATIO = 0.62;
const WHITE_W = 1400;
const WHITE_H = Math.round(WHITE_W / PAGE_RATIO);

let whiteImageUrl = "";

function getWhiteImageUrl() {
  if (whiteImageUrl) return whiteImageUrl;
  const canvas = document.createElement("canvas");
  canvas.width = WHITE_W;
  canvas.height = WHITE_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    whiteImageUrl =
      "data:image/svg+xml," +
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${WHITE_W}" height="${WHITE_H}"><rect width="100%" height="100%" fill="#ffffff"/></svg>`
      );
    return whiteImageUrl;
  }
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, WHITE_W, WHITE_H);
  whiteImageUrl = canvas.toDataURL("image/png");
  return whiteImageUrl;
}

function measurePage(stage) {
  const maxW = Math.max((stage?.clientWidth || 0) - 20, 140);
  const maxH = Math.max((stage?.clientHeight || 0) - 12, 180);
  const heightCap = Math.floor(maxH * MAX_HEIGHT_RATIO);

  let pageWidth = maxW / 2;
  let pageHeight = pageWidth / PAGE_RATIO;

  if (pageHeight > heightCap) {
    pageHeight = heightCap;
    pageWidth = pageHeight * PAGE_RATIO;
  }

  pageWidth = Math.floor(pageWidth * 0.92);
  pageHeight = Math.floor(pageHeight * 0.92);

  return {
    pageWidth: Math.max(100, pageWidth),
    pageHeight: Math.max(140, pageHeight),
  };
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Could not load ${src}`));
    img.src = src;
  });
}

async function splitSpread(src, crop) {
  const img = await loadImage(src);
  const halfW = Math.max(1, Math.floor(img.naturalWidth / 2));
  const height = img.naturalHeight || 1;
  const canvas = document.createElement("canvas");
  canvas.width = halfW;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, halfW, height);
  ctx.drawImage(
    img,
    crop === "left" ? 0 : halfW,
    0,
    halfW,
    height,
    0,
    0,
    halfW,
    height
  );

  return canvas.toDataURL("image/png");
}

async function sheetToImageUrl(sheet, cache) {
  if (cache.has(sheet.id)) return cache.get(sheet.id);
  if (sheet.kind === "blank") {
    const url = getWhiteImageUrl();
    cache.set(sheet.id, url);
    return url;
  }

  const src = s3DisplaySrc(sheet.src);
  const url =
    sheet.kind === "split" ? await splitSpread(src, sheet.crop) : src;

  cache.set(sheet.id, url);
  return url;
}

async function resolveSheetImages(sheets, cache) {
  return Promise.all(sheets.map((sheet) => sheetToImageUrl(sheet, cache)));
}

export default function ClassicFlipEngine({ pages, active = true }) {
  const stageRef = useRef(null);
  const flipRef = useRef(null);
  const pageRef = useRef(0);
  const sizeRef = useRef({ w: 0, h: 0 });
  const imageCacheRef = useRef(new Map());
  const coverModeRef = useRef("front");
  const activeRef = useRef(active);
  const { playFlipSound } = useFlipSound();
  const playFlipSoundRef = useRef(playFlipSound);
  const [spread, setSpread] = useState({ current: 1, total: 1 });
  const [coverMode, setCoverMode] = useState("front");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const sheets = buildFlipSheets(pages);
  const pagesKey = sheets.map((sheet) => sheet.id).join("|");

  useEffect(() => {
    coverModeRef.current = coverMode;
  }, [coverMode]);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    playFlipSoundRef.current = playFlipSound;
  }, [playFlipSound]);

  useEffect(() => {
    if (!active || loading) return undefined;
    const stage = stageRef.current;
    if (!stage) return undefined;

    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    if (!isMobile) return undefined;

    let touchStart = null;
    let touchHandled = false;

    function applyFlip(goNext) {
      const mode = coverModeRef.current;
      if (mode === "front") {
        if (goNext) flipRef.current?.flipNext("top");
        return;
      }
      if (mode === "back") {
        if (!goNext) flipRef.current?.flipPrev("top");
        return;
      }
      if (goNext) flipRef.current?.flipNext("top");
      else flipRef.current?.flipPrev("top");
    }

    function tapSide(clientX) {
      const book = stage.querySelector(".stf__parent");
      if (!book) return;
      const rect = book.getBoundingClientRect();
      if (rect.width < 8 || rect.height < 8) return;
      applyFlip(clientX - rect.left >= rect.width / 2);
    }

    function onTouchStart(event) {
      const touch = event.touches[0];
      if (!touch) return;
      touchStart = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };
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
        tapSide(touch.clientX);
        return;
      }

      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
        event.preventDefault();
        touchHandled = true;
        window.setTimeout(() => {
          touchHandled = false;
        }, 400);
        applyFlip(dx < 0);
      }
    }

    function onClick(event) {
      if (touchHandled) return;
      event.preventDefault();
      tapSide(event.clientX);
    }

    stage.addEventListener("touchstart", onTouchStart, { passive: true });
    stage.addEventListener("touchend", onTouchEnd, { passive: false });
    stage.addEventListener("click", onClick);

    return () => {
      stage.removeEventListener("touchstart", onTouchStart);
      stage.removeEventListener("touchend", onTouchEnd);
      stage.removeEventListener("click", onClick);
    };
  }, [active, loading, pagesKey]);

  useEffect(() => {
    const stage = stageRef.current;
    const built = buildFlipSheets(pages);
    if (!stage || !built.length) {
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    let pageFlip = null;
    let resizeTimer = 0;
    let hasMountedOnce = false;

    async function mount(startPage, { showLoader = true } = {}) {
      if (showLoader) setLoading(true);
      setLoadError("");

      let imageUrls;
      try {
        imageUrls = await resolveSheetImages(built, imageCacheRef.current);
      } catch {
        if (!cancelled) {
          setLoadError("Could not load album photos.");
          setLoading(false);
        }
        return;
      }

      const { PageFlip } = await import("page-flip/dist/js/page-flip.module.js");
      if (cancelled || !stageRef.current) return;

      try {
        pageFlip?.destroy();
      } catch {
        /* already gone */
      }
      pageFlip = null;
      stage.innerHTML = "";

      const { pageWidth, pageHeight } = measurePage(stage);
      if (pageWidth < 80 || pageHeight < 80) {
        if (!cancelled) setLoading(false);
        return;
      }
      sizeRef.current = { w: stage.clientWidth, h: stage.clientHeight };

      const book = document.createElement("div");
      book.className = "classic-flip-book";
      stage.appendChild(book);

      const isMobile = window.matchMedia("(max-width: 768px)").matches;

      pageFlip = new PageFlip(book, {
        width: pageWidth,
        height: pageHeight,
        size: "fixed",
        showCover: true,
        usePortrait: false,
        autoSize: false,
        drawShadow: true,
        maxShadowOpacity: 0.4,
        flippingTime: 700,
        startZIndex: 4,
        mobileScrollSupport: false,
        swipeDistance: 28,
        disableFlipByClick: isMobile,
        useMouseEvents: !isMobile,
        startPage: Math.min(startPage, Math.max(built.length - 1, 0)),
      });

      pageFlip.loadFromImages(imageUrls);

      const syncSpread = (index) => {
        const collection = pageFlip.getPageCollection();
        const current =
          typeof index === "number" ? index : collection.getCurrentPageIndex();
        const spreadIndex = collection.getCurrentSpreadIndex();
        const totalSpreads = collection.getSpread().length;
        pageRef.current = current;
        setSpread({
          current: spreadIndex + 1,
          total: totalSpreads,
        });
        if (spreadIndex === 0) setCoverMode("front");
        else if (spreadIndex === totalSpreads - 1) setCoverMode("back");
        else setCoverMode("open");
      };

      pageFlip.on("init", () => {
        syncSpread();
        hasMountedOnce = true;
        if (!cancelled) setLoading(false);
      });
      pageFlip.on("flip", (event) => {
        syncSpread(event.data);
        if (activeRef.current) playFlipSoundRef.current();
      });
      flipRef.current = pageFlip;
    }

    mount(pageRef.current, { showLoader: true });

    const observer = new ResizeObserver(() => {
      if (!activeRef.current) return;
      const next = { w: stage.clientWidth, h: stage.clientHeight };
      if (next.w < 40 || next.h < 40) return;
      if (
        Math.abs(next.w - sizeRef.current.w) < 10 &&
        Math.abs(next.h - sizeRef.current.h) < 10
      ) {
        return;
      }
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(
        () => mount(pageRef.current, { showLoader: !hasMountedOnce }),
        180
      );
    });
    observer.observe(stage);

    return () => {
      cancelled = true;
      observer.disconnect();
      window.clearTimeout(resizeTimer);
      try {
        pageFlip?.destroy();
      } catch {
        /* already gone */
      }
      flipRef.current = null;
      if (stageRef.current) stageRef.current.innerHTML = "";
    };
  }, [pages, pagesKey]);

  useEffect(() => {
    if (!active) return undefined;

    function onKey(event) {
      if (event.key === "ArrowRight") flipRef.current?.flipNext("top");
      if (event.key === "ArrowLeft") flipRef.current?.flipPrev("top");
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  if (!sheets.length) {
    return (
      <p className="text-sm text-white/60">This album has no pages yet.</p>
    );
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      {loading ? (
        <p className="pointer-events-none absolute inset-x-0 top-1/2 z-20 -translate-y-1/2 text-center text-sm text-amber-100/80">
          Opening album…
        </p>
      ) : null}
      {loadError ? (
        <p className="absolute inset-x-0 top-4 z-20 text-center text-sm text-rose-300">
          {loadError}
        </p>
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
      <div className="flex shrink-0 items-center justify-center gap-4 py-3">
        <button
          type="button"
          aria-label="Previous page"
          disabled={loading}
          className="grid size-9 place-items-center rounded-full border border-amber-200/40 text-amber-100 transition hover:bg-white/10 disabled:opacity-40"
          onClick={() => flipRef.current?.flipPrev("top")}
        >
          <ChevronLeft className="size-5" />
        </button>
        <p className="min-w-16 text-center text-xs tracking-[0.18em] text-amber-100/80 uppercase">
          {spread.current} / {spread.total}
        </p>
        <button
          type="button"
          aria-label="Next page"
          disabled={loading}
          className="grid size-9 place-items-center rounded-full border border-amber-200/40 text-amber-100 transition hover:bg-white/10 disabled:opacity-40"
          onClick={() => flipRef.current?.flipNext("top")}
        >
          <ChevronRight className="size-5" />
        </button>
      </div>
    </div>
  );
}
