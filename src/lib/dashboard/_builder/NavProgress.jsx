"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const MIN_VISIBLE_MS = 700;

export default function NavProgress() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const [runId, setRunId] = useState(0);
  const startedAtRef = useRef(0);
  const hideTimerRef = useRef(null);

  useEffect(() => {
    if (!startedAtRef.current) {
      setActive(false);
      return;
    }

    const wait = Math.max(
      0,
      MIN_VISIBLE_MS - (Date.now() - startedAtRef.current)
    );
    hideTimerRef.current = setTimeout(() => {
      setActive(false);
      startedAtRef.current = 0;
      hideTimerRef.current = null;
    }, wait);

    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };
  }, [pathname]);

  useEffect(() => {
    function start() {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
      startedAtRef.current = Date.now();
      setRunId((id) => id + 1);
      setActive(true);
    }

    function onClick(event) {
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const anchor = event.target.closest?.("a[href]");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:")) return;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) {
        return;
      }

      const next = new URL(anchor.href, window.location.href);
      if (next.origin !== window.location.origin) return;
      if (!next.pathname.startsWith("/dashboard")) return;
      if (
        next.pathname === window.location.pathname &&
        next.search === window.location.search
      ) {
        return;
      }

      start();
    }

    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  if (!active) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[200] h-[5px] overflow-hidden"
      aria-hidden
    >
      <div key={runId} className="dash-nav-progress h-full w-full" />
    </div>
  );
}
