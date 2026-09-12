"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";

/**
 * Full-viewport centered overlay, portaled to document.body so parent
 * transforms / overflow (e.g. dash-fade-up) cannot trap position:fixed.
 */
export default function ViewportCenterOverlay({ children, isDark = true }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const html = document.documentElement;
    const body = document.body;
    const main = document.querySelector("main");
    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;
    const prevMain = main?.style.overflow ?? "";

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    if (main) main.style.overflow = "hidden";

    return () => {
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
      if (main) main.style.overflow = prevMain;
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-200 flex items-center justify-center p-6 backdrop-blur-sm",
        isDark ? "bg-black/55" : "bg-black/40"
      )}
      role="alertdialog"
      aria-modal="true"
    >
      {children}
    </div>,
    document.body
  );
}
