"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Languages } from "lucide-react";
import { cn } from "@/lib/cn";

const SCRIPT_ID = "google-translate-script";
const HOST_ID = "google_translate_element";
const SHELL_ID = "rd-translate-shell";

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

function widgetHost(shell) {
  const nodes = [...document.querySelectorAll(`#${HOST_ID}`)];
  const host = nodes[0] || document.createElement("div");
  host.id = HOST_ID;
  host.className = "notranslate";
  host.setAttribute("translate", "no");
  nodes.slice(1).forEach((node) => node.remove());
  if (host.parentElement !== shell) shell.appendChild(host);
  return host;
}

function comboReady(host) {
  const combo = host.querySelector("select.goog-te-combo");
  return Boolean(combo && combo.options.length > 1);
}

function translateShell() {
  let shell = document.getElementById(SHELL_ID);
  if (!shell) {
    shell = document.createElement("div");
    shell.id = SHELL_ID;
    shell.className = "notranslate";
    shell.setAttribute("translate", "no");
    shell.dataset.open = "0";
    const status = document.createElement("p");
    status.className = "rd-translate-status";
    status.textContent = "Loading languages…";
    shell.appendChild(status);
    document.body.appendChild(shell);
  }
  return shell;
}

function placeShell(shell, button, open) {
  shell.dataset.open = open ? "1" : "0";
  if (!open || !button) return;
  const rect = button.getBoundingClientRect();
  const width = 256;
  const left = Math.min(Math.max(8, rect.right - width), window.innerWidth - width - 8);
  shell.style.top = `${rect.bottom + 8}px`;
  shell.style.left = `${left}px`;
}

function loadTranslateScript() {
  if (document.getElementById(SCRIPT_ID)) return;
  const script = document.createElement("script");
  script.id = SCRIPT_ID;
  script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  script.async = true;
  document.body.appendChild(script);
}

export default function GoogleTranslate({ appearance = "light" }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const dark = appearance === "dark";

  useEffect(() => {
    protectReactFromTranslate();
    const shell = translateShell();
    const host = widgetHost(shell);
    const status = shell.querySelector(".rd-translate-status");
    let cancelled = false;
    let attempts = 0;
    let timer = 0;

    function paint() {
      if (status) status.hidden = comboReady(host);
    }

    function mount() {
      if (cancelled || !window.google?.translate?.TranslateElement || comboReady(host)) {
        paint();
        return;
      }
      if (!host.querySelector("select.goog-te-combo")) {
        new window.google.translate.TranslateElement({ pageLanguage: "en", autoDisplay: false }, HOST_ID);
      }
      paint();
    }

    window.googleTranslateElementInit = () => mount();

    function tick() {
      if (cancelled) return;
      attempts += 1;
      mount();
      if (comboReady(host) || attempts >= 16) return;
      if (attempts === 8) {
        host.replaceChildren();
        document.getElementById(SCRIPT_ID)?.remove();
        loadTranslateScript();
      }
      timer = window.setTimeout(tick, 250);
    }

    if (window.google?.translate?.TranslateElement) tick();
    else loadTranslateScript();

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [pathname]);

  useEffect(() => {
    const shell = document.getElementById(SHELL_ID);
    if (!open) {
      if (shell) shell.dataset.open = "0";
      return undefined;
    }
    function place() {
      if (shell) placeShell(shell, buttonRef.current, true);
    }
    function onPointer(event) {
      const target = event.target;
      if (rootRef.current?.contains(target) || shell?.contains(target)) return;
      setOpen(false);
    }
    function onKey(event) {
      if (event.key === "Escape") setOpen(false);
    }
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, pathname]);

  return (
    <div ref={rootRef} className="notranslate relative" translate="no">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={HOST_ID}
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
    </div>
  );
}
