"use client";

import { Loader, useTexture } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { Provider, useAtom } from "jotai";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Suspense, useEffect, useRef, useState } from "react";
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

function fitBookToStage(stageW, stageH, isMobile, forceLandscape = false) {
  const cameraZ = isMobile ? (forceLandscape ? 8.4 : 7.6) : 4.35;
  const cameraY = isMobile ? 0.18 : 0.32;
  const cameraFov = CAMERA_FOV;
  const padding = forceLandscape ? 0.72 : FIT_PADDING;

  if (stageW < 40 || stageH < 40) {
    return {
      bookScale: isMobile ? 0.7 : 1,
      cameraZ,
      cameraY,
      cameraFov,
    };
  }

  const aspect = stageW / Math.max(stageH, 1);
  const fovRad = (cameraFov * Math.PI) / 180;
  const visibleH = 2 * cameraZ * Math.tan(fovRad / 2);
  const visibleW = visibleH * aspect;
  const bookScale = Math.min(
    (visibleW * padding) / OPEN_BOOK_W,
    (visibleH * padding) / OPEN_BOOK_H
  );

  return {
    bookScale: Math.max(0.4, bookScale),
    cameraZ,
    cameraY,
    cameraFov,
  };
}

function CameraRig({ cameraY, cameraZ, cameraFov }) {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, cameraY, cameraZ);
    camera.fov = cameraFov;
    camera.updateProjectionMatrix();
  }, [camera, cameraY, cameraZ, cameraFov]);

  return null;
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

function FlipStage({
  bookPages,
  textureUrls,
  active = true,
  isMobile = false,
  forceLandscape = false,
}) {
  const stageRef = useRef(null);
  const [, setPage] = useAtom(pageAtom);
  const bookRotationRef = useRef(INITIAL_BOOK_Y);
  const dragRef = useRef({ moved: false });
  const pointerDragRef = useRef(null);
  const forceLandscapeRef = useRef(forceLandscape);
  const [viewFit, setViewFit] = useState(() =>
    fitBookToStage(
      isMobile ? 896 : 1280,
      isMobile ? 414 : 720,
      isMobile,
      forceLandscape
    )
  );

  useEffect(() => {
    forceLandscapeRef.current = forceLandscape;
  }, [forceLandscape]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;

    function measure() {
      // Layout size ignores CSS rotate — required under force-landscape.
      const width = stage.clientWidth;
      const height = stage.clientHeight;
      setViewFit(fitBookToStage(width, height, isMobile, forceLandscape));
    }

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    return () => observer.disconnect();
  }, [isMobile, forceLandscape]);

  const { bookScale, cameraZ, cameraY, cameraFov } = viewFit;

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
      // Inverse of CSS rotate(90deg): local X follows screen Y.
      const localDx = forceLandscapeRef.current ? dy : dx;
      const localDy = forceLandscapeRef.current ? -dx : dy;

      if (
        !dragRef.current.moved &&
        (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD)
      ) {
        dragRef.current.moved = true;
        canvas.style.cursor = "grabbing";
      }

      if (!dragRef.current.moved) return;

      bookRotationRef.current = drag.startRot + localDx * 0.012;
      void localDy;
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
        tapSide(event.clientX, event.clientY);
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

  function tapSide(clientX, clientY) {
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    if (rect.width < 8 || rect.height < 8) return;

    if (forceLandscapeRef.current) {
      // After rotate(90deg), content right sits toward the top of the phone.
      applyFlip(clientY < rect.top + rect.height / 2);
      return;
    }

    applyFlip(clientX - rect.left >= rect.width / 2);
  }

  return (
    <div ref={stageRef} className="flip-stage min-h-0 flex-1 touch-manipulation">
      <Canvas
        shadows={!isMobile}
        dpr={isMobile ? 1 : [1, 1.5]}
        className="h-full w-full"
        resize={{ scroll: false, offsetSize: true }}
        camera={{
          position: [0, cameraY, cameraZ],
          fov: cameraFov,
        }}
        gl={{
          antialias: !isMobile,
          alpha: true,
          powerPreference: "high-performance",
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
          bindCanvasPointerHandlers(gl.domElement);
        }}
      >
        <Suspense fallback={null}>
          <CameraRig
            cameraY={cameraY}
            cameraZ={cameraZ}
            cameraFov={cameraFov}
          />
          <BookExperience
            bookPages={bookPages}
            dragRef={dragRef}
            bookRotationRef={bookRotationRef}
            scale={bookScale}
            lite={isMobile}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

function FlipEngineInner({
  bookPages,
  textureUrls,
  active = true,
  isMobile = false,
  forceLandscape = false,
}) {
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
      <FlipStage
        bookPages={bookPages}
        textureUrls={textureUrls}
        active={active}
        isMobile={isMobile}
        forceLandscape={forceLandscape}
      />
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
