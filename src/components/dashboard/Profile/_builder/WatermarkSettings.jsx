"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth";
import { updateSocialLinks } from "@/lib/api/client/auth";
import { cn } from "@/lib/cn";

const POSITIONS = [
  { id: "bottom-right", label: "Bottom right" },
  { id: "bottom-left", label: "Bottom left" },
  { id: "top-right", label: "Top right" },
  { id: "top-left", label: "Top left" },
  { id: "center", label: "Center" },
  { id: "diagonal", label: "Diagonal" },
];
const OPACITIES = [0.2, 0.35, 0.45, 0.7, 0.9];

export default function WatermarkSettings({ user, isDark }) {
  const { applyUser } = useAuth();
  const [enabled, setEnabled] = useState(user?.watermark_enabled !== false);
  const [text, setText] = useState(user?.watermark_text || "");
  const [position, setPosition] = useState(user?.watermark_position || "bottom-right");
  const [opacity, setOpacity] = useState(Number(user?.watermark_opacity) || 0.45);
  const [saving, setSaving] = useState(false);
  const preview = text.trim() || (user?.studio_name ? `© ${user.studio_name}` : "© Studio");

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    try {
      const result = await updateSocialLinks({
        watermark_enabled: enabled,
        watermark_text: text.trim(),
        watermark_position: position,
        watermark_opacity: opacity,
      });
      if (result.data?.user) applyUser(result.data.user);
      toast.success("Watermark saved to your profile");
    } catch (error) {
      toast.error(error.message || "Could not save the watermark.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className={cn("space-y-4 rounded-[1.6rem] border p-4 backdrop-blur-xl sm:p-5", isDark ? "border-white/10 bg-white/8" : "border-white/50 bg-white/25 shadow-[0_8px_32px_-24px_rgba(80,90,140,0.4)]")}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className={cn("font-serif text-lg font-bold", isDark ? "text-white" : "text-stone-900")}>Photo watermark</h3>
          <p className={cn("text-xs", isDark ? "text-stone-400" : "text-stone-500")}>Saved on your profile and shown across client selection photos.</p>
        </div>
        <label className="flex items-center gap-2 text-xs font-semibold">
          <input type="checkbox" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} />
          {enabled ? "Active" : "Off"}
        </label>
      </div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500">
        Watermark text
        <input value={text} disabled={!enabled} onChange={(event) => setText(event.target.value)} maxLength={120} placeholder={user?.studio_name ? `© ${user.studio_name}` : "© Studio name"} className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm font-normal normal-case tracking-normal text-stone-900 outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50" />
      </label>
      <div>
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-stone-500">Position</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {POSITIONS.map((item) => <button key={item.id} type="button" disabled={!enabled} onClick={() => setPosition(item.id)} className={`rounded-xl border px-3 py-2 text-left text-xs font-medium ${position === item.id && enabled ? "border-amber-500 bg-amber-50 text-amber-900" : "border-stone-200 text-stone-600"} disabled:opacity-50`}>{item.label}</button>)}
        </div>
      </div>
      <div>
        <div className="mb-1.5 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-stone-500"><span>Opacity</span><span className="font-mono text-amber-700">{Math.round(opacity * 100)}%</span></div>
        <div className="flex gap-1.5">{OPACITIES.map((value) => <button key={value} type="button" disabled={!enabled} onClick={() => setOpacity(value)} className={`flex-1 rounded-lg py-1.5 text-[11px] font-bold ${Math.round(opacity * 100) === Math.round(value * 100) ? "bg-amber-600 text-white" : "border border-stone-200 bg-stone-100 text-stone-700"} disabled:opacity-40`}>{Math.round(value * 100)}%</button>)}</div>
      </div>
      <div className="relative grid aspect-[4/3] place-items-center overflow-hidden rounded-2xl bg-gradient-to-tr from-amber-950 via-stone-900 to-rose-950 text-center text-white">
        <div><p className="font-serif text-lg font-bold">Wedding couple portrait</p><p className="font-mono text-[11px] tracking-widest text-amber-200/70">DSC_0411.JPG</p></div>
        {enabled ? <Preview text={preview} position={position} opacity={opacity} /> : null}
      </div>
      <button type="submit" disabled={saving} className="rounded-xl bg-amber-700 px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50">{saving ? "Saving…" : "Save watermark"}</button>
    </form>
  );
}

function Preview({ text, position, opacity }) {
  if (position === "diagonal") {
    return <div className="pointer-events-none absolute inset-0 flex rotate-[-25deg] scale-125 flex-col justify-around" style={{ opacity }}>{[0, 1, 2].map((row) => <div key={row} className="flex justify-around font-serif text-sm font-bold tracking-widest text-white"><span>{text}</span><span>{text}</span></div>)}</div>;
  }
  const place = { "bottom-right": "bottom-3 right-3", "bottom-left": "bottom-3 left-3", "top-right": "top-3 right-3", "top-left": "top-3 left-3", center: "inset-0 grid place-items-center" }[position] || "bottom-3 right-3";
  return <div className={`pointer-events-none absolute ${place}`} style={{ opacity }}><span className="font-serif text-sm font-bold tracking-widest text-white drop-shadow">{text}</span></div>;
}
