"use client";

import { useCallback, useEffect, useState } from "react";

const MOBILE_MAX = 768;

function isMobileViewport() {
  return window.innerWidth < MOBILE_MAX || window.innerHeight < MOBILE_MAX;
}

function isPortraitViewport() {
  return window.innerHeight > window.innerWidth;
}

async function requestFullscreen(el) {
  if (!el) return false;
  try {
    if (el.requestFullscreen) {
      await el.requestFullscreen();
      return true;
    }
    if (el.webkitRequestFullscreen) {
      await el.webkitRequestFullscreen();
      return true;
    }
  } catch {
    /* blocked or unsupported */
  }
  return false;
}

async function lockLandscape() {
  try {
    const orientation = screen.orientation;
    if (orientation?.lock) {
      await orientation.lock("landscape");
      return true;
    }
  } catch {
    /* iOS / permission */
  }
  return false;
}

async function exitFullscreen() {
  try {
    if (document.fullscreenElement && document.exitFullscreen) {
      await document.exitFullscreen();
    } else if (document.webkitFullscreenElement && document.webkitExitFullscreen) {
      await document.webkitExitFullscreen();
    }
  } catch {
    /* ignore */
  }
  try {
    screen.orientation?.unlock?.();
  } catch {
    /* ignore */
  }
}

/**
 * Mobile flip viewer chrome: CSS landscape fallback + fullscreen / orientation lock.
 */
export function useMobileFlipChrome(containerRef) {
  const [isMobile, setIsMobile] = useState(false);
  const [forceLandscape, setForceLandscape] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const sync = useCallback(() => {
    const mobile = isMobileViewport();
    const portrait = isPortraitViewport();
    setIsMobile(mobile);
    // Native landscape (or locked) → no CSS rotate. Portrait phone → CSS force.
    setForceLandscape(mobile && portrait);
    setIsFullscreen(
      Boolean(document.fullscreenElement || document.webkitFullscreenElement)
    );
  }, []);

  useEffect(() => {
    sync();
    window.addEventListener("resize", sync);
    window.addEventListener("orientationchange", sync);
    document.addEventListener("fullscreenchange", sync);
    document.addEventListener("webkitfullscreenchange", sync);

    return () => {
      window.removeEventListener("resize", sync);
      window.removeEventListener("orientationchange", sync);
      document.removeEventListener("fullscreenchange", sync);
      document.removeEventListener("webkitfullscreenchange", sync);
    };
  }, [sync]);

  useEffect(() => {
    if (!forceLandscape) return undefined;

    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";

    return () => {
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
    };
  }, [forceLandscape]);

  const enterImmersive = useCallback(async () => {
    if (!isMobileViewport()) return;
    const el = containerRef.current;
    await requestFullscreen(el);
    await lockLandscape();
    // Re-sync after fullscreen / orientation settle; keep CSS rotate if still portrait.
    window.setTimeout(() => {
      sync();
      window.dispatchEvent(new Event("resize"));
    }, 160);
  }, [containerRef, sync]);

  const toggleFullscreen = useCallback(async () => {
    if (!isMobileViewport()) return;
    if (document.fullscreenElement || document.webkitFullscreenElement) {
      await exitFullscreen();
      sync();
      return;
    }
    await enterImmersive();
  }, [enterImmersive, sync]);

  return {
    isMobile,
    forceLandscape,
    isFullscreen,
    enterImmersive,
    toggleFullscreen,
  };
}
