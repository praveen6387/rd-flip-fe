"use client";

import { Loader, useTexture } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Provider, useAtom } from "jotai";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import {
  buildBookPages,
  collectTextureUrls,
} from "./book/buildBookPages";
import BookExperience from "./book/BookExperience";
import { PAGE_HEIGHT, PAGE_WIDTH } from "./book/pageGeometry";
import { pageAtom } from "./book/state";
import { useFlipSound } from "./useFlipSound";

const INITIAL_BOOK_Y = -Math.PI / 2;
const DRAG_THRESHOLD = 8;
const OPEN_BOOK_W = PAGE_WIDTH * 2;
const OPEN_BOOK_H = PAGE_HEIGHT;
const FIT_PADDING = 0.84;
const CAMERA_FOV = 36;

function fitBookToStage(stageW, stageH) {
  const isMobile = stageW > 0 && stageW <= 768;
  const cameraZ = isMobile ? 7.6 : 4.35;
  const cameraY = isMobile ? 0.22 : 0.32;
  const cameraFov = CAMERA_FOV;

  if (stageW < 40 || stageH < 40) {
    return {
      bookScale: isMobile ? 0.78 : 1,
      cameraZ,
      cameraY,
      cameraFov,
      isMobile,
    };
  }

  const aspect = stageW / Math.max(stageH, 1);
  const fovRad = (cameraFov * Math.PI) / 180;
  const visibleH = 2 * cameraZ * Math.tan(fovRad / 2);
  const visibleW = visibleH * aspect;
  const bookScale = Math.min(
    (visibleW * FIT_PADDING) / OPEN_BOOK_W,
    (visibleH * FIT_PADDING) / OPEN_BOOK_H
  );

  return {
    bookScale: Math.max(0.45, bookScale),
    cameraZ,
    cameraY,
    cameraFov,
    isMobile,
  };
}

function BookControls({ totalSpreads, active = true }) {
  const [page, setPage] = useAtom(pageAtom);
  const { playFlipSound } = useFlipSound();
  const maxPage = Math.max(totalSpreads - 1, 0);
  const skipSoundRef = useRef(true);

  useEffect(() => {
    if (!active) {
      skipSoundRef.current = true;
      return;
    }
    if (skipSoundRef.current) {
      skipSoundRef.current = false;
      return;
    }
    playFlipSound();
  }, [page, active, playFlipSound]);

  useEffect(() => {
    if (!active) return undefined;

    function onKey(event) {
      if (event.key === "ArrowRight") {
        setPage((current) => Math.min(maxPage, current + 1));
      }
      if (event.key === "ArrowLeft") {
        setPage((current) => Math.max(0, current - 1));
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, maxPage, setPage]);

  return (
    <div className="flex shrink-0 flex-col items-center gap-2 py-3">
      <p className="text-[10px] tracking-[0.16em] text-amber-100/45 uppercase">
        Hold &amp; drag to rotate
      </p>
      <div className="flex items-center justify-center gap-4">
        <button
          type="button"
          aria-label="Previous page"
          disabled={page <= 0}
          className="grid size-9 place-items-center rounded-full border border-amber-200/40 text-amber-100 transition hover:bg-white/10 disabled:opacity-40"
          onClick={() => setPage((current) => Math.max(0, current - 1))}
        >
          <ChevronLeft className="size-5" />
        </button>
        <p className="min-w-16 text-center text-xs tracking-[0.18em] text-amber-100/80 uppercase">
          {page + 1} / {totalSpreads}
        </p>
        <button
          type="button"
          aria-label="Next page"
          disabled={page >= maxPage}
          className="grid size-9 place-items-center rounded-full border border-amber-200/40 text-amber-100 transition hover:bg-white/10 disabled:opacity-40"
          onClick={() => setPage((current) => Math.min(maxPage, current + 1))}
        >
          <ChevronRight className="size-5" />
        </button>
      </div>
    </div>
  );
}

function FlipStage({ bookPages, active = true }) {
  const stageRef = useRef(null);
  const [, setPage] = useAtom(pageAtom);
  const bookRotationRef = useRef(INITIAL_BOOK_Y);
  const dragRef = useRef({ moved: false });
  const pointerDragRef = useRef(null);
  const textureUrls = useMemo(() => collectTextureUrls(bookPages), [bookPages]);
  const [viewFit, setViewFit] = useState(() => fitBookToStage(1280, 720));

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;

    function measure() {
      const { width, height } = stage.getBoundingClientRect();
      setViewFit(fitBookToStage(width, height));
    }

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  const { bookScale, cameraZ, cameraY, cameraFov, isMobile } = viewFit;

  useEffect(() => {
    textureUrls.forEach((url) => useTexture.preload(url));
  }, [textureUrls]);

  useEffect(() => {
    setPage(0);
    bookRotationRef.current = INITIAL_BOOK_Y;
  }, [bookPages, setPage]);

  const canvasCleanupRef = useRef(null);
  const canvasElRef = useRef(null);

  function bindCanvasPointerHandlers(canvas) {
    canvasCleanupRef.current?.();
    canvasElRef.current = canvas;
    if (!active) {
      canvas.style.cursor = "default";
      canvasCleanupRef.current = null;
      return;
    }
    canvas.style.cursor = "grab";

    function onPointerDown(event) {
      pointerDragRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        startRot: bookRotationRef.current,
        time: Date.now(),
      };
      dragRef.current.moved = false;
    }

    function onPointerMove(event) {
      const drag = pointerDragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;

      const dx = event.clientX - drag.startX;
      const dy = event.clientY - drag.startY;

      if (
        !dragRef.current.moved &&
        (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD)
      ) {
        dragRef.current.moved = true;
        canvas.style.cursor = "grabbing";
      }

      if (!dragRef.current.moved) return;

      bookRotationRef.current = drag.startRot + dx * 0.012;
    }

    function finishPointer(event) {
      const drag = pointerDragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;

      const wasDrag = dragRef.current.moved;
      pointerDragRef.current = null;
      canvas.style.cursor = "grab";

      if (
        !wasDrag &&
        Date.now() - drag.time < 450 &&
        event.target === canvas
      ) {
        tapSide(event.clientX);
      }

      window.setTimeout(() => {
        dragRef.current.moved = false;
      }, 80);
    }

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", finishPointer);
    canvas.addEventListener("pointercancel", finishPointer);

    canvasCleanupRef.current = () => {
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", finishPointer);
      canvas.removeEventListener("pointercancel", finishPointer);
    };
  }

  useEffect(() => () => canvasCleanupRef.current?.(), []);

  useEffect(() => {
    if (canvasElRef.current) {
      bindCanvasPointerHandlers(canvasElRef.current);
    }
  }, [active]);

  function applyFlip(goNext) {
    setPage((current) => {
      const maxPage = bookPages.length;
      if (goNext) return Math.min(maxPage, current + 1);
      return Math.max(0, current - 1);
    });
  }

  function tapSide(clientX) {
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    if (rect.width < 8 || rect.height < 8) return;
    applyFlip(clientX - rect.left >= rect.width / 2);
  }

  return (
    <div ref={stageRef} className="flip-stage min-h-0 flex-1 touch-manipulation">
      <Canvas
        key={isMobile ? "mobile" : "desktop"}
        shadows
        dpr={[1, 2]}
        className="h-full w-full"
        camera={{
          position: [0, cameraY, cameraZ],
          fov: cameraFov,
        }}
        gl={{ antialias: true, alpha: true }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
          bindCanvasPointerHandlers(gl.domElement);
        }}
      >
        <Suspense fallback={null}>
          <BookExperience
            bookPages={bookPages}
            dragRef={dragRef}
            bookRotationRef={bookRotationRef}
            scale={bookScale}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

function FlipEngineInner({ pages, active = true }) {
  const bookPages = useMemo(() => buildBookPages(pages), [pages]);

  if (!bookPages.length) {
    return (
      <p className="text-sm text-white/60">This album has no pages yet.</p>
    );
  }

  const totalSpreads = bookPages.length + 1;

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      {active ? (
        <Loader
          containerStyles={{
            background: "transparent",
          }}
          innerStyles={{
            background: "rgb(255 255 255 / 8%)",
          }}
          barStyles={{
            background: "#fbbf24",
          }}
          dataStyles={{
            color: "rgb(254 243 199 / 85%)",
            fontSize: "11px",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        />
      ) : null}
      <FlipStage bookPages={bookPages} active={active} />
      <BookControls totalSpreads={totalSpreads} active={active} />
    </div>
  );
}

export default function FlipEngine(props) {
  return (
    <Provider>
      <FlipEngineInner {...props} />
    </Provider>
  );
}
