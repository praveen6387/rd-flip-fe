"use client";

import { AlertCircle, BookOpen, Check, IndianRupee, Infinity, Layers, Sparkles, Target } from "lucide-react";

export default function SelectionRules({ form, photoCount = 0, onChange }) {
  const mode = form.selectionMode || "UNLIMITED";
  const perSheet = Math.max(1, Number(form.photosPerSheet) || 4);
  const required = Number(form.requiredPhotos) || (photoCount > 0 ? photoCount : 50);
  const included = Number(form.includedPhotos) || (photoCount > 0 ? photoCount : 50);
  const sheetPrice = Number(form.extraSheetPrice ?? 300);
  const fixedSheets = Math.ceil(required / perSheet);
  const includedSheets = Math.ceil(included / perSheet);
  const presets = [25, 50, 75, 100].filter((value) => photoCount === 0 || (value < photoCount && value !== photoCount));

  function selectMode(next) {
    const sheets = Math.ceil((next === "MIN_EXTRA" ? included : required) / perSheet);
    onChange({
      selectionMode: next,
      includedSheets: sheets,
      strictLimit: next === "FIXED",
      allowExtraPhotos: next !== "FIXED",
      enableExtraSheetPricing: next === "MIN_EXTRA" && sheetPrice > 0,
    });
  }

  function setTarget(field, value) {
    const count = Number(value);
    const sheets = count > 0 ? Math.ceil(count / perSheet) : form.includedSheets;
    onChange({ [field]: count, includedSheets: sheets, maxSelectionLimit: count });
  }

  function setPerSheet(value) {
    const next = Math.max(1, Number(value) || 1);
    const target = mode === "MIN_EXTRA" ? included : required;
    onChange({ photosPerSheet: next, includedSheets: Math.ceil(target / next) });
  }

  function targetRow(field, label, current, hint) {
    return (
      <div className="grid items-start gap-4 md:grid-cols-2">
        <div>
          <div className="mb-1.5 flex min-h-5 items-center justify-between gap-2">
            <span className="text-xs font-semibold whitespace-nowrap text-stone-800">{label} *</span>
            <span className="shrink-0 text-[11px] font-medium text-stone-400">{photoCount > 0 ? `Available: ${photoCount}` : hint}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input type="number" min="1" max={photoCount > 0 ? photoCount : 5000} value={form[field] ?? current} onChange={(event) => setTarget(field, event.target.value)} className="w-24 shrink-0 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 font-mono text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500" />
            {photoCount > 0 ? <button type="button" onClick={() => setTarget(field, photoCount)} className={`rounded-lg px-2.5 py-1.5 text-xs font-bold whitespace-nowrap ${Number(form[field]) === photoCount ? "bg-amber-600 text-white" : "border border-amber-300/40 bg-amber-100 text-amber-900"}`}>All ({photoCount})</button> : null}
            {presets.map((value) => <button key={value} type="button" onClick={() => setTarget(field, value)} className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold ${Number(form[field]) === value ? "bg-amber-600 text-white" : "bg-stone-100 text-stone-700"}`}>{value}</button>)}
          </div>
        </div>
        <SheetAverage value={form.photosPerSheet ?? 4} onChange={setPerSheet} />
      </div>
    );
  }

  return (
    <div className="space-y-3.5 rounded-2xl border border-amber-500/20 bg-gradient-to-b from-amber-500/5 to-transparent p-4">
      <div className="flex items-center gap-2">
        <div className="rounded-lg bg-amber-500/15 p-1.5 text-amber-600"><Target className="size-4" /></div>
        <div>
          <h4 className="text-xs font-bold tracking-wider text-stone-900 uppercase">Album Selection Rules (3 Smart Options)</h4>
          <p className="text-[11px] text-stone-500">Choose how your client will select photos for the album</p>
        </div>
      </div>
      <div className="grid gap-2.5 sm:grid-cols-3">
        <ModeCard active={mode === "UNLIMITED"} icon={<Infinity className="size-4 shrink-0" />} title="1. Unlimited Selection" text="Clients can select any number of photos. Total sheets auto-calculate from photos per sheet." onClick={() => selectMode("UNLIMITED")} />
        <ModeCard active={mode === "FIXED"} icon={<Target className="size-4 shrink-0" />} title="2. Fixed Sheets / Target" text="Specify exact target photos and sheet average. Target sheets auto-calculate and lock." onClick={() => selectMode("FIXED")} />
        <ModeCard active={mode === "MIN_EXTRA"} icon={<Layers className="size-4 shrink-0" />} title="3. Fixed + Extra Sheets" text="Base package + extra sheet rate. Clients see a confirmation prompt before adding extra photos." onClick={() => selectMode("MIN_EXTRA")} />
      </div>

      {mode === "UNLIMITED" ? (
        <div className="space-y-3 rounded-xl border border-stone-200 bg-white p-3.5">
          <SheetAverage value={form.photosPerSheet ?? 4} onChange={setPerSheet} />
          <div className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 p-2.5 text-[11px] text-amber-900">
            <span className="text-base">💡</span>
            <span><strong>Option 1 Rules:</strong> Clients can select any number of photos with real-time sheet calculation: <strong>Selected Photos ÷ {perSheet} = Total Sheets</strong>. No restrictions or limits.</span>
          </div>
        </div>
      ) : null}

      {mode === "FIXED" ? (
        <div className="space-y-3.5 rounded-xl border border-stone-200 bg-white p-3.5">
          {photoCount > 0 && required > photoCount ? (
            <div className="flex items-start gap-2.5 rounded-xl border border-rose-300 bg-rose-50 p-3 text-xs text-rose-800">
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-rose-600" />
              <div>
                <p className="text-xs font-bold">Error: Only {photoCount} photos uploaded, target cannot exceed {photoCount}!</p>
                <p className="mt-0.5 text-[11px] text-rose-700">Client gallery cannot have a selection target higher than total uploaded photos.</p>
                <button type="button" onClick={() => setTarget("requiredPhotos", photoCount)} className="mt-2 rounded-lg bg-rose-600 px-3 py-1 text-[11px] font-bold text-white">Fix: Set to Available Total ({photoCount} Photos)</button>
              </div>
            </div>
          ) : null}
          {targetRow("requiredPhotos", "Total Photos Required", required, "Exact match required")}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-500/25 bg-amber-500/10 p-3 text-xs">
            <div className="flex items-center gap-2 text-stone-700"><BookOpen className="size-4 text-amber-600" />Formula: {required} photos ÷ {perSheet}/sheet = <strong className="font-mono text-sm text-amber-700">{fixedSheets} Final Album Sheets</strong></div>
            <span className="rounded-md border border-emerald-300/50 bg-emerald-100/80 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">✓ Client must select exactly {required} photos</span>
          </div>
        </div>
      ) : null}

      {mode === "MIN_EXTRA" ? (
        <div className="space-y-3.5 rounded-xl border border-stone-200 bg-white p-3.5">
          {photoCount > 0 && included > photoCount ? (
            <div className="flex items-start gap-2.5 rounded-xl border border-rose-300 bg-rose-50 p-3 text-xs text-rose-800">
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-rose-600" />
              <div>
                <p className="text-xs font-bold">Error: Only {photoCount} photos uploaded, package limit cannot exceed {photoCount}!</p>
                <button type="button" onClick={() => setTarget("includedPhotos", photoCount)} className="mt-2 rounded-lg bg-rose-600 px-3 py-1 text-[11px] font-bold text-white">Fix: Set to Available Total ({photoCount} Photos)</button>
              </div>
            </div>
          ) : null}
          {targetRow("includedPhotos", "Included Package Photos", included, "Base package limit")}
          <div className="space-y-2.5 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3">
            <div className="flex items-center gap-2 text-xs text-stone-700"><BookOpen className="size-4 text-amber-600" />Included Package: {included} photos ÷ {perSheet}/sheet = <strong className="font-mono text-sm text-amber-800">{includedSheets} Included Sheets</strong></div>
            <div className="flex flex-col justify-between gap-3 border-t border-amber-500/20 pt-2.5 sm:flex-row sm:items-center">
              <div>
                <span className="flex items-center gap-1 text-xs font-bold text-stone-800"><IndianRupee className="size-3.5 text-emerald-600" />Studio Extra Sheet Price (Fixed Charge)</span>
                <p className="mt-0.5 text-[11px] text-stone-500">Charged per additional sheet when client selects beyond {included} included photos.</p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <span className="text-xs font-bold text-stone-600">₹</span>
                <input type="number" min="0" step="50" value={form.extraSheetPrice ?? 300} onChange={(event) => onChange({ extraSheetPrice: Number(event.target.value), enableExtraSheetPricing: Number(event.target.value) > 0 })} className="w-24 rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 font-mono text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500" />
                <span className="text-[11px] whitespace-nowrap text-stone-500">/ extra sheet</span>
              </div>
            </div>
          </div>
          <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-2.5 text-[11px] text-emerald-900">
            <Sparkles className="mt-0.5 size-4 shrink-0 text-emerald-600" />
            <div><strong>Client Workflow in Mode 3:</strong> Once the client reaches {included} photos and attempts to select an additional photo, the system prompts them for confirmation: <em className="mt-0.5 block">"Studio has set an extra charge of ₹{sheetPrice}/sheet. Would you like to add extra photos?"</em></div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ModeCard({ active, icon, title, text, onClick }) {
  return (
    <button type="button" onClick={onClick} className={`relative flex flex-col gap-1.5 rounded-xl border p-3 text-left ${active ? "border-amber-500 bg-amber-500/10 text-stone-900 shadow-sm ring-2 ring-amber-500/20" : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"}`}>
      <span className="flex items-start justify-between gap-1.5">
        <span className={`flex items-center gap-1.5 ${active ? "text-amber-600" : "text-stone-400"}`}>{icon}<span className="text-xs font-bold text-stone-900">{title}</span></span>
        {active ? <span className="grid size-4 shrink-0 place-items-center rounded-full bg-amber-600 text-white"><Check className="size-2.5" /></span> : null}
      </span>
      <span className="text-[11px] leading-relaxed text-stone-500">{text}</span>
    </button>
  );
}

function SheetAverage({ value, onChange }) {
  return (
    <div>
      <div className="mb-1.5 text-xs font-semibold text-stone-800">Photos Per Sheet (Average)</div>
      <div className="flex items-center gap-2">
        <input type="number" min="1" max="20" value={value} onChange={(event) => onChange(event.target.value)} className="w-20 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 font-mono text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500" />
        <div className="flex items-center gap-1">{[3, 4, 5, 6].map((number) => <button key={number} type="button" onClick={() => onChange(number)} className={`rounded-lg px-2.5 py-1.5 text-xs font-bold ${Number(value) === number ? "bg-amber-600 text-white shadow-sm" : "bg-stone-100 text-stone-700"}`}>{number}p</button>)}</div>
      </div>
    </div>
  );
}
