"use client";

import { useState } from "react";

const MOBILE_MAX = 768;

/**
 * Snapshot of the viewport on first render only.
 * Refresh the page to re-read orientation / size.
 */
export function useInitialViewport() {
  return useState(() => {
    if (typeof window === "undefined") {
      return { isMobile: false, isPortrait: false, width: 1280, height: 720 };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;

    return {
      isMobile: width < MOBILE_MAX,
      isPortrait: height > width,
      width,
      height,
    };
  })[0];
}
