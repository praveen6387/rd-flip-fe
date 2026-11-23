"use client";
import { CheckCircle2, Eye, Heart, Loader2, Lock, Sparkles } from "lucide-react";
import { selectionQuote } from "@/lib/photo-selection/rules";

export function selectionProgress(rules, selectedCount, totalCount) {
  const quote = selectionQuote(rules, selectedCount, totalCount);
  const sheets = `${quote.estimatedSheets} sheet${quote.estimatedSheets === 1 ? "" : "s"}`;
  const charge = quote.totalExtraCharge > 0 ? ` · Extra ₹${quote.totalExtraCharge}` : "";
  if (quote.mode === "FIXED") {
    const ready = quote.remaining === 0;
    const remaining = quote.remaining;
    return { canConfirm: ready, badge: `${selectedCount} selected · ${sheets}`, message: ready ? `Target reached.${charge}` : remaining > 0 ? `${remaining} remaining · ${sheets}` : `Deselect ${-remaining} · ${sheets}` };
  }
  if (quote.mode === "MIN_EXTRA") {
    const ready = quote.remaining === 0;
    return { canConfirm: ready, badge: `${selectedCount} selected · ${sheets}`, message: ready ? (quote.extraPhotos ? `+${quote.extraPhotos} extra · ${quote.extraSheets} extra sheets${charge}` : `Included package reached${charge}`) : `${quote.remaining} remaining · ${sheets}` };
  }
  return { canConfirm: selectedCount > 0, badge: `${selectedCount} selected · ${sheets}`, message: selectedCount ? `Ready to confirm · ${sheets}` : "Select at least 1 photo" };
}

function SelectionSummary({ progress, selectedCount, saving, locked, onReview, onConfirm, onSummary }) {
  return (
    <>
      <div className="flex min-w-0 items-center gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-xl border border-rose-500/30 bg-rose-500/20 text-rose-400"><Heart className="size-5 fill-rose-500" /></div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2"><span className="text-sm font-bold">{selectedCount} selected</span><span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${progress.canConfirm ? "border-emerald-500/30 bg-emerald-500/20 text-emerald-300" : "border-amber-500/30 bg-amber-500/20 text-amber-300"}`}>{progress.badge}</span></div>
          {locked ? <p className="flex items-center gap-1 text-[11px] text-emerald-400"><Lock className="size-3" />Selections locked and confirmed</p> : saving ? <p className="flex items-center gap-1 text-[11px] text-amber-300"><Loader2 className="size-3 animate-spin" />Saving…</p> : <p className="flex items-center gap-1 text-[11px] text-stone-300"><CheckCircle2 className="size-3 text-emerald-400" />Auto-saved · {progress.message}</p>}
        </div>
      </div>
      <div className="flex shrink-0 gap-2">
        <button type="button" disabled={!selectedCount} onClick={onReview} className="inline-flex items-center gap-1 rounded-xl border border-stone-700 bg-stone-800 px-3 py-2 text-xs font-semibold disabled:opacity-40"><Eye className="size-3.5" />Review</button>
        {locked ? <button type="button" onClick={onSummary} className="inline-flex items-center gap-1 rounded-xl border border-emerald-700 bg-emerald-950 px-3 py-2 text-xs font-semibold text-emerald-300"><Sparkles className="size-3.5" />Summary</button> : <button type="button" disabled={!progress.canConfirm} onClick={onConfirm} className={`inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-bold ${progress.canConfirm ? "bg-emerald-600 text-white" : "cursor-not-allowed bg-stone-800 text-stone-400"}`}><CheckCircle2 className="size-4" />Confirm</button>}
      </div>
    </>
  );
}

export default function GalleryFloatingBar({ project, rules, selectedCount, totalCount, saving, locked, inline, onReview, onConfirm, onSummary }) {
  const progress = selectionProgress(rules || project, selectedCount, totalCount);
  const bar = (
    <div className="pointer-events-auto flex w-full max-w-2xl items-center justify-between gap-3 rounded-2xl border border-stone-700/60 bg-stone-900/95 px-4 py-3 text-white shadow-2xl backdrop-blur">
      <SelectionSummary progress={progress} selectedCount={selectedCount} saving={saving} locked={locked} onReview={onReview} onConfirm={onConfirm} onSummary={onSummary} />
    </div>
  );
  if (inline) return bar;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-3 z-30 flex justify-center px-3 sm:bottom-6">
      {bar}
    </div>
  );
}
