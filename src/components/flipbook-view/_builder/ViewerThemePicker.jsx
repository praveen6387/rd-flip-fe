"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Palette } from "lucide-react";
import { VIEWER_THEMES } from "./viewerThemes";

export default function ViewerThemePicker({ themeId, onChange }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event) {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    }

    function onKeyDown(event) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="viewer-theme-picker">
      <button
        type="button"
        className="viewer-theme-picker__btn"
        aria-label="Choose background theme"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <Palette className="size-4" strokeWidth={1.75} />
      </button>

      {open ? (
        <div
          className="viewer-theme-picker__menu"
          role="listbox"
          aria-label="Background themes"
        >
          <p className="viewer-theme-picker__title">Background</p>
          {VIEWER_THEMES.map((theme) => {
            const active = theme.id === themeId;
            return (
              <button
                key={theme.id}
                type="button"
                role="option"
                aria-selected={active}
                className={`viewer-theme-picker__item${
                  active ? " is-active" : ""
                }`}
                onClick={() => {
                  onChange(theme.id);
                  setOpen(false);
                }}
              >
                <span className="viewer-theme-picker__swatch" data-theme={theme.id} />
                <span className="viewer-theme-picker__copy">
                  <span className="viewer-theme-picker__label">{theme.label}</span>
                  <span className="viewer-theme-picker__desc">
                    {theme.description}
                  </span>
                </span>
                {active ? (
                  <Check className="viewer-theme-picker__check size-3.5" />
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
