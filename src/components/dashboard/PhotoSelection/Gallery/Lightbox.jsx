"use client";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Heart, Loader2, Star, X } from "lucide-react";
import Watermark from "./Watermark";
import { rotationClass } from "./rotation";

export default function GalleryLightbox({ photo, photos, locked, watermark, onClose, onToggle, onUpdate, onNavigate, summary }) {
  const index = Math.max(0, photos.findIndex((item) => item.id === photo.id));
  const current = photos[index] || photo;
  const [note, setNote] = useState(current.notes || "");
  const [savingNote, setSavingNote] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const lastTouch = useRef(0);
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

  function select() {
    if (locked) return;
    const next = !current.isSelected;
    setFeedback(next ? "selected" : "unselected");
    setTimeout(() => setFeedback(null), 750);
    onToggle(current, next);
  }

  function touchEnd(event) {
    const now = Date.now();
    if (now - lastTouch.current < 320) {
      event.preventDefault();
      lastTouch.current = 0;
      select();
      return;
    }
    lastTouch.current = now;
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-stone-950/95 text-white">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <p className="truncate font-mono text-sm">{current.originalFilename} · {index + 1} / {photos.length}</p>
        <button type="button" onClick={onClose} className="grid size-10 shrink-0 place-items-center rounded-full bg-white/10" aria-label="Close"><X /></button>
      </div>
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-14">
        <button type="button" disabled={index === 0} onClick={() => onNavigate(photos[index - 1])} className="absolute left-3 grid size-11 place-items-center rounded-full bg-white/10 disabled:opacity-30" aria-label="Previous"><ChevronLeft /></button>
        <div className="relative max-h-full max-w-full" onDoubleClick={select} onTouchEnd={touchEnd}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={current.thumbnailUrl} alt={current.originalFilename} draggable="false" className={`max-h-[70vh] max-w-full object-contain ${rotationClass(current.rotation)}`} />
          <Watermark watermark={watermark} large />
          {feedback ? <div className="pointer-events-none absolute inset-0 z-30 grid place-items-center">{feedback === "selected" ? <div className="selection-heart-pop grid size-20 place-items-center rounded-full bg-rose-600/95 text-white"><Heart className="size-11 fill-white" /></div> : <div className="selection-heart-pop grid size-20 place-items-center rounded-full bg-stone-900/95 text-2xl font-black text-rose-400">✕</div>}</div> : null}
        </div>
        <button type="button" disabled={index >= photos.length - 1} onClick={() => onNavigate(photos[index + 1])} className="absolute right-3 grid size-11 place-items-center rounded-full bg-white/10 disabled:opacity-30" aria-label="Next"><ChevronRight /></button>
      </div>
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex w-fit shrink-0 items-center gap-2 rounded-2xl border border-white/10 bg-stone-900 px-3 py-2">
          <button type="button" disabled={locked} onClick={select} className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${current.isSelected ? "bg-rose-500" : "bg-white/10"}`}><Heart className={`size-4 ${current.isSelected ? "fill-white" : ""}`} />{current.isSelected ? "Selected" : "Select"}</button>
          {[1, 2, 3, 4, 5].map((star) => <button key={star} type="button" disabled={locked} onClick={() => onUpdate(current, { rating: current.rating === star ? 0 : star })} className={`rounded-full px-1 py-1 text-sm ${current.rating >= star ? "text-amber-300" : "text-white/50"}`} aria-label={`${star} star`}><Star className={`size-4 ${current.rating >= star ? "fill-amber-300" : ""}`} /></button>)}
        </div>
        {summary ? <div className="flex min-w-0 flex-1 justify-center">{summary}</div> : <div className="flex-1" />}
        <form className="flex w-fit shrink-0 items-center gap-2 rounded-2xl border border-white/10 bg-stone-900 px-3 py-2" onSubmit={async (event) => { event.preventDefault(); if (savingNote) return; setSavingNote(true); try { await onUpdate(current, { notes: note }); } finally { setSavingNote(false); } }}>
          <input value={note} maxLength={2000} disabled={locked || savingNote} onChange={(event) => setNote(event.target.value)} placeholder="Retouching note" className="w-44 rounded-full bg-white/10 px-4 py-2 text-sm outline-none" />
          <button type="submit" disabled={locked || savingNote} className="inline-flex h-9 w-16 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-stone-900 disabled:opacity-70">{savingNote ? <Loader2 className="size-4 animate-spin" /> : "Save"}</button>
        </form>
      </div>
    </div>
  );
}
