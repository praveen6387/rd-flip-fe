"use client";
import { useRef, useState } from "react";
import { Check, FileText, Folder, Heart, Star, ZoomIn } from "lucide-react";
import Watermark from "./Watermark";

export default function GalleryPhotoCard({ photo, onToggle, onOpen, locked, watermark }) {
  const [feedback, setFeedback] = useState(null);
  const clickTimer = useRef(null);
  const lastTouch = useRef(0);

  function toggle() {
    if (locked) return;
    const next = !photo.isSelected;
    setFeedback(next ? "selected" : "unselected");
    setTimeout(() => setFeedback(null), 750);
    onToggle(photo, next);
  }

  function click() {
    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
      clickTimer.current = null;
      toggle();
      return;
    }
    clickTimer.current = setTimeout(() => {
      clickTimer.current = null;
      onOpen(photo);
    }, 240);
  }

  return (
    <div
      onClick={click}
      onDoubleClick={(event) => { event.stopPropagation(); if (clickTimer.current) clearTimeout(clickTimer.current); clickTimer.current = null; toggle(); }}
      onTouchEnd={() => {
        const now = Date.now();
        if (now - lastTouch.current < 320) { if (clickTimer.current) clearTimeout(clickTimer.current); clickTimer.current = null; toggle(); lastTouch.current = 0; }
        else lastTouch.current = now;
      }}
      className={`group relative cursor-pointer select-none overflow-hidden rounded-2xl bg-stone-100 shadow-sm transition duration-300 hover:shadow-xl ${photo.isSelected ? "ring-4 ring-rose-500 shadow-rose-500/15" : "hover:ring-2 hover:ring-stone-400"}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-stone-200">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo.thumbnailUrl} alt={photo.originalFilename} draggable="false" className="pointer-events-none h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <Watermark watermark={watermark} />
        {feedback ? <div className="pointer-events-none absolute inset-0 z-30 grid place-items-center">{feedback === "selected" ? <div className="selection-heart-pop grid size-20 place-items-center rounded-full bg-rose-600/95 text-white ring-4 ring-white/70"><Heart className="size-11 fill-white" /></div> : <div className="selection-heart-pop grid size-20 place-items-center rounded-full bg-stone-900/95 text-2xl font-black text-rose-400 ring-4 ring-white/40">✕</div>}</div> : null}
        <button type="button" disabled={locked} onClick={(event) => { event.stopPropagation(); toggle(); }} className={`absolute top-3 right-3 z-10 grid size-10 place-items-center rounded-full backdrop-blur ${photo.isSelected ? "bg-rose-500 text-white ring-2 ring-white/80" : "bg-black/45 text-white"}`} aria-label={photo.isSelected ? "Deselect photo" : "Select photo"}><Heart className={`size-5 ${photo.isSelected ? "fill-white" : ""}`} /></button>
        <div className="pointer-events-none absolute top-3 left-3 z-10 flex flex-col items-start gap-1">
          {photo.isSelected ? <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/95 px-2.5 py-1 text-[11px] font-bold text-white"><Check className="size-3" />Selected</span> : null}
          {photo.coverType === "FRONT" ? <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-black tracking-wide text-stone-950">FRONT COVER</span> : null}
          {photo.coverType === "BACK" ? <span className="rounded-full bg-sky-600 px-2 py-0.5 text-[10px] font-black tracking-wide text-white">BACK COVER</span> : null}
          {photo.rating > 0 ? <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-stone-900/90 px-2 py-0.5 text-[10px] font-bold text-amber-300"><Star className="size-3 fill-amber-400 text-amber-400" />{photo.rating}★</span> : null}
          {photo.notes ? <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-stone-900/90 px-2 py-0.5 text-[10px] text-emerald-300"><FileText className="size-3" />Note</span> : null}
        </div>
        <div className="pointer-events-none absolute inset-x-3 bottom-3 flex items-end justify-between text-white opacity-0 transition group-hover:opacity-100">
          <span className="truncate font-mono text-xs drop-shadow">{photo.originalFilename}{photo.subfolder ? <span className="mt-0.5 flex items-center gap-1 font-sans text-[10px] text-amber-200"><Folder className="size-2.5" />{photo.subfolder}</span> : null}</span>
          <span className="rounded-md bg-white/20 p-1"><ZoomIn className="size-3.5" /></span>
        </div>
      </div>
    </div>
  );
}
