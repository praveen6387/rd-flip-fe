"use client";
import { useEffect, useState } from "react";
import { getPublicAlbum, submitSelection } from "@/lib/photo-selection/store";
import { Button } from "@/components/ui/button";
export default function ClientSelection({ token }) {
  const [album, setAlbum] = useState(null), [ids, setIds] = useState(new Set()), [error, setError] = useState(""), [busy, setBusy] = useState(false);
  useEffect(() => { let active = true; getPublicAlbum(token).then(a => { if (active) { setAlbum(a); setIds(new Set(a.photos.filter(p => p.selected).map(p => p.id))); } }).catch(e => { if (active) setError(e.message); }); return () => { active = false; }; }, [token]);
  async function submit() { setBusy(true); setError(""); try { setAlbum(await submitSelection(token, [...ids])); } catch(e) { setError(e.message); } finally { setBusy(false); } }
  if (!album) return <main className="p-8 text-center">{error || "Loading photos…"}</main>;
  const submitted = album.status === "selected";
  return <main className="min-h-screen bg-slate-50 p-4 text-slate-900 sm:p-8"><div className="mx-auto max-w-6xl">
    <h1 className="text-2xl font-semibold">{album.folderName}</h1><p className="my-2">{album.clientName} · {album.photoCount} photos</p>
    <p className="mb-4">{submitted ? "Your selection has been submitted to the studio." : "Click the photos you want, then submit your folder. You cannot change it after submission."}</p>
    {error && <p role="alert" className="my-3 text-rose-600">{error}</p>}
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{album.photos.map(photo => <button key={photo.id} type="button" aria-pressed={ids.has(photo.id)} disabled={submitted || busy} className={`overflow-hidden rounded-xl border bg-white text-left ${ids.has(photo.id) ? "ring-4 ring-sky-500" : ""}`} onClick={() => setIds(current => { const next = new Set(current); if (next.has(photo.id)) next.delete(photo.id); else next.add(photo.id); return next; })}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`${photo.imageUrl}?share=${encodeURIComponent(token)}`} alt={photo.name} className="aspect-square w-full object-cover" /><span className="block truncate p-2 text-xs">{ids.has(photo.id) ? "✓ " : ""}{photo.name}</span>
    </button>)}</div>
    <div className="sticky bottom-3 mt-6 flex items-center justify-between rounded-xl border bg-white p-4 shadow-lg"><span>{ids.size} selected</span><Button disabled={submitted || busy || !ids.size} onClick={submit}>{submitted ? "Submitted" : busy ? "Submitting…" : "Submit selection"}</Button></div>
  </div></main>;
}
