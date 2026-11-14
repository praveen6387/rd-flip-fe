"use client";

import { useEffect, useRef, useState } from "react";
import { Languages } from "lucide-react";
import { cn } from "@/lib/cn";

const SCRIPT_ID = "google-translate-script";

function protectReactFromTranslate() {
  if (typeof Node !== "function" || Node.prototype.__rdFlipTranslateGuard) return;
  const removeChild = Node.prototype.removeChild;
  const insertBefore = Node.prototype.insertBefore;
  Node.prototype.removeChild = function removeChildSafe(child) {
    if (child.parentNode !== this) return child;
    return removeChild.call(this, child);
  };
  Node.prototype.insertBefore = function insertBeforeSafe(node, child) {
    if (child && child.parentNode !== this) return node;
    return insertBefore.call(this, node, child);
  };
  Node.prototype.__rdFlipTranslateGuard = true;
}

export default function GoogleTranslate({ appearance = "light" }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const dark = appearance === "dark";

  useEffect(() => {
    protectReactFromTranslate();

    window.googleTranslateElementInit = () => {
      const host = document.getElementById("google_translate_element");
      if (!host || host.dataset.ready === "1" || !window.google?.translate?.TranslateElement) return;
      host.dataset.ready = "1";
      new window.google.translate.TranslateElement(
        { pageLanguage: "en", autoDisplay: false },
        "google_translate_element"
      );
    };

    if (window.google?.translate?.TranslateElement) {
      window.googleTranslateElementInit();
      return undefined;
    }

    if (!document.getElementById(SCRIPT_ID)) {
      const script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    }

    return undefined;
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    function onPointer(event) {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    }
    function onKey(event) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="notranslate relative" translate="no">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="google_translate_element"
        aria-label="Translate"
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "grid size-10 place-items-center rounded-full border transition",
          dark
            ? "border-white/25 bg-white/10 text-white hover:bg-white/16"
            : "border-slate-200/80 bg-white/70 text-slate-700 hover:bg-white"
        )}
      >
        <Languages className="size-4" strokeWidth={1.75} />
      </button>
      <div
        className={cn(
          "absolute top-full right-0 z-50 mt-2 w-64 rounded-2xl border border-stone-200 bg-white p-2.5 text-left text-stone-800 shadow-lg",
          open ? "" : "pointer-events-none invisible h-0 overflow-hidden border-0 p-0"
        )}
      >
        <div id="google_translate_element" />
      </div>
    </div>
  );
}
