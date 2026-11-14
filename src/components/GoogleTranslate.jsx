"use client";

import { useEffect, useState } from "react";
import { Languages } from "lucide-react";

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

export default function GoogleTranslate() {
  const [open, setOpen] = useState(false);

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

  return (
    <div className="notranslate pointer-events-none fixed top-3 right-3 z-[45]" translate="no">
      <div className="pointer-events-auto flex flex-col items-end">
        <button
          type="button"
          aria-expanded={open}
          aria-controls="google_translate_element"
          onClick={() => setOpen((current) => !current)}
          className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white/95 px-3 py-1.5 text-xs font-semibold text-stone-800 shadow-lg backdrop-blur"
        >
          <Languages className="size-3.5" />
          Translate
        </button>
        <div className={`w-64 overflow-hidden rounded-2xl border border-stone-200 bg-white/95 text-stone-800 shadow-lg backdrop-blur ${open ? "mt-2 p-2.5" : "pointer-events-none h-0 border-0 p-0 opacity-0 shadow-none"}`}>
          <div id="google_translate_element" />
        </div>
      </div>
    </div>
  );
}
