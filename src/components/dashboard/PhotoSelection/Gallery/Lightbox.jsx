"use client";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Heart, Star, X } from "lucide-react";
import Watermark from "./Watermark";

export default function GalleryLightbox({ photo, photos, locked, watermark, onClose, onToggle, onUpdate, onNavigate }) {
  const index = Math.max(0, photos.findIndex((item) => item.id === photo.id));
  const current = photos[index] || photo;
  const [note, setNote] = useState(current.notes || "");
  useEffect(() => { setNote(current.notes || ""); }, [current.id, current.notes]);
  useEffect(() => {
    function onKey(event) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight" && index < photos.length - 1) onNavigate(photos[index + 1]);
      if (event.key === "ArrowLeft" && index > 0) onNavigate(photos[index - 1]);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, photos, onClose, onNavigate]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-stone-950/95 text-white">
      <div className="flex items-center justify-between px-4 py-3">
        <p className="truncate font-mono text-sm">{current.originalFilename} · {index + 1} / {photos.length}</p>
        <button type="button" onClick={onClose} className="grid size-10 place-items-center rounded-full bg-white/10" aria-label="Close"><X /></button>
      </div>
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-14">
        <button type="button" disabled={index === 0} onClick={() => onNavigate(photos[index - 1])} className="absolute left-3 grid size-11 place-items-center rounded-full bg-white/10 disabled:opacity-30" aria-label="Previous"><ChevronLeft /></button>
        <div className="relative max-h-full max-w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={current.thumbnailUrl} alt={current.originalFilename} className="max-h-[70vh] max-w-full object-contain" />
          <Watermark watermark={watermark} large />
        </div>
        <button type="button" disabled={index >= photos.length - 1} onClick={() => onNavigate(photos[index + 1])} className="absolute right-3 grid size-11 place-items-center rounded-full bg-white/10 disabled:opacity-30" aria-label="Next"><ChevronRight /></button>
      </div>
      <div className="flex flex-col gap-3 border-t border-white/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <button type="button" disabled={locked} onClick={() => onToggle(current, !current.isSelected)} className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${current.isSelected ? "bg-rose-500" : "bg-white/10"}`}><Heart className={`size-4 ${current.isSelected ? "fill-white" : ""}`} />{current.isSelected ? "Selected" : "Select"}</button>
        <div className="flex flex-wrap items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => <button key={star} type="button" disabled={locked} onClick={() => onUpdate(current, { rating: current.rating === star ? 0 : star })} className={`rounded-full px-2 py-1 text-sm ${current.rating >= star ? "text-amber-300" : "text-white/50"}`} aria-label={`${star} star`}><Star className={`size-4 ${current.rating >= star ? "fill-amber-300" : ""}`} /></button>)}
          <button type="button" disabled={locked} onClick={() => onUpdate(current, { coverType: current.coverType === "FRONT" ? "" : "FRONT" })} className={`rounded-full px-3 py-1 text-xs font-bold ${current.coverType === "FRONT" ? "bg-amber-400 text-stone-950" : "bg-white/10"}`}>Front cover</button>
          <button type="button" disabled={locked} onClick={() => onUpdate(current, { coverType: current.coverType === "BACK" ? "" : "BACK" })} className={`rounded-full px-3 py-1 text-xs font-bold ${current.coverType === "BACK" ? "bg-sky-500" : "bg-white/10"}`}>Back cover</button>
        </div>
        <form className="flex min-w-0 flex-1 gap-2 sm:max-w-sm" onSubmit={(event) => { event.preventDefault(); onUpdate(current, { notes: note }); }}>
          <input value={note} maxLength={2000} disabled={locked} onChange={(event) => setNote(event.target.value)} placeholder="Retouching note" className="min-w-0 flex-1 rounded-full bg-white/10 px-4 py-2 text-sm outline-none" />
          <button type="submit" disabled={locked} className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-stone-900">Save</button>
        </form>
      </div>
    </div>
  );
}
