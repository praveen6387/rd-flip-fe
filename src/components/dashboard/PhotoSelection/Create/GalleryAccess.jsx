"use client";

import { Calendar, KeyRound, Loader2 } from "lucide-react";

export default function GalleryAccess({ form, accessCode, updating, saving, onCode, onDeadline, onWelcome, onUpdate }) {
  return (
    <div className="space-y-4">
      <div className="space-y-3 rounded-2xl border border-stone-200 bg-stone-50/80 p-4">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs font-bold text-stone-800"><KeyRound className="size-3.5 text-amber-600" />Access code and selection deadline</span>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="rounded-xl border border-stone-200 bg-white p-2">
            <span className="mb-1 block text-[10px] font-bold tracking-wider text-stone-500 uppercase">Access code</span>
            <span className="flex items-center gap-2">
              <input inputMode="numeric" maxLength={6} value={accessCode} onChange={(event) => onCode(event.target.value.replace(/\D/g, "").slice(0, 6))} className="min-w-0 flex-1 font-mono text-lg tracking-[0.2em] outline-none" />
              <button type="button" disabled={updating || saving} onClick={onUpdate} className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-amber-700 px-2.5 py-1.5 text-[11px] font-bold text-white shadow-sm disabled:opacity-50">{updating ? <Loader2 className="size-3.5 animate-spin" /> : null}{updating ? "Saving…" : "Update"}</button>
            </span>
          </label>
          <label className="rounded-xl border border-stone-200 bg-white p-2">
            <span className="mb-1 flex items-center gap-1 text-[10px] font-bold tracking-wider text-stone-500 uppercase"><Calendar className="size-3" />Selection deadline</span>
            <input type="date" value={form.selectionDeadline || ""} onChange={(event) => onDeadline(event.target.value)} className="w-full text-xs outline-none" />
          </label>
        </div>
      </div>
      <label className="block text-xs font-bold text-stone-700">Welcome message
        <textarea rows={2} maxLength={4000} value={form.welcomeMessage || ""} onChange={(event) => onWelcome(event.target.value)} className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-normal outline-none focus:ring-2 focus:ring-amber-500" />
      </label>
    </div>
  );
}
