"use client";

import { Maximize2, Minimize2 } from "lucide-react";

export default function FullscreenToggle({ active, onToggle }) {
  return (
    <button
      type="button"
      aria-label={active ? "Exit fullscreen" : "Enter fullscreen"}
      aria-pressed={active}
      onClick={onToggle}
      className="grid size-9 place-items-center rounded-full border border-amber-200/40 text-amber-100 transition hover:bg-white/10"
    >
      {active ? (
        <Minimize2 className="size-4" strokeWidth={1.75} />
      ) : (
        <Maximize2 className="size-4" strokeWidth={1.75} />
      )}
    </button>
  );
}
