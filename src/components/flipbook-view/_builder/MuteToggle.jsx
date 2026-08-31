"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useFlipSound } from "./useFlipSound";

export default function MuteToggle() {
  const { muted, toggleMute } = useFlipSound();

  return (
    <button
      type="button"
      aria-label={muted ? "Unmute page sounds" : "Mute page sounds"}
      aria-pressed={muted}
      onClick={toggleMute}
      className="grid size-8 place-items-center rounded-full border border-amber-200/25 bg-black/35 text-amber-100/80 backdrop-blur-sm transition hover:bg-white/10 hover:text-amber-50 sm:size-9"
    >
      {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
    </button>
  );
}
