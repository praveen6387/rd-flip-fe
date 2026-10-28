"use client";
import { useEffect, useState } from "react";
import { getPublicAlbum, submitSelection } from "@/lib/photo-selection/store";
import { grantedSelection, grantSelection } from "@/lib/photo-selection/grant";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ClientSelection({ token }) {
  const [phase, setPhase] = useState("check");
  const [album, setAlbum] = useState(null);
  const [ids, setIds] = useState(new Set());
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [code, setCode] = useState("");
  const [access, setAccess] = useState(null);

  function showAlbum(next, nextAccess) {
    setAlbum(next);
    setIds(new Set(next.photos.filter((photo) => photo.selected).map((photo) => photo.id)));
    setAccess(nextAccess);
    setPhase("photos");
  }

  useEffect(() => {
    let active = true;
    (async () => {
      const grant = grantedSelection();
      if (grant?.token === token) {
        try {
          const next = await getPublicAlbum(token, { code: grant.code });
          if (active) showAlbum(next, { code: grant.code });
          return;
        } catch {
          // The saved code no longer opens this folder.
        }
      }
      if (active) setPhase("code");
    })();
    return () => { active = false; };
  }, [token]);

  async function unlock(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/photo-selection/access/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.data?.shareToken) {
        throw new Error(response.status === 429 ? "Too many attempts. Please wait a minute and try again." : result?.message || "Could not open photo selection.");
      }
      if (result.data.shareToken !== token) throw new Error("This code does not match this folder.");
      grantSelection(token, code);
      showAlbum(await getPublicAlbum(token, { code }), { code });
    } catch (unlockError) {
      setError(unlockError.message);
    } finally {
      setBusy(false);
    }
  }

  async function submit() {
    setBusy(true);
    setError("");
    try {
      setAlbum(await submitSelection(token, [...ids], access));
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setBusy(false);
    }
  }

  if (phase === "check") return <main className="p-8 text-center">Loading photos…</main>;
  if (phase === "code") {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 p-6 text-slate-900">
        <form onSubmit={unlock} className="w-full max-w-sm space-y-5 rounded-2xl border bg-white p-7 shadow-sm">
          <h1 className="text-2xl font-semibold">Select your photos</h1>
          <p className="text-sm text-slate-600">Enter the six-digit code shared by your studio.</p>
          <div className="space-y-2">
            <Label htmlFor="selection-code">Selection code</Label>
            <Input id="selection-code" inputMode="numeric" autoComplete="off" pattern="[0-9]{6}" minLength={6} maxLength={6} required value={code} onChange={(event) => setCode(event.target.value.replace(/[^0-9]/g, "").slice(0, 6))} placeholder="123456" className="text-center text-xl tracking-[0.4em]" />
          </div>
          {error ? <p role="alert" className="text-sm text-rose-600">{error}</p> : null}
          <Button type="submit" disabled={busy || code.length !== 6} className="w-full">{busy ? "Opening…" : "Open photos"}</Button>
        </form>
      </main>
    );
  }

  const submitted = album.status === "selected";
  return <main className="min-h-screen bg-slate-50 p-4 text-slate-900 sm:p-8"><div className="mx-auto max-w-6xl">
    <h1 className="text-2xl font-semibold">{album.folderName}</h1><p className="my-2">{album.clientName} · {album.photoCount} photos</p>
    <p className="mb-4">{submitted ? "Your selection has been submitted to the studio." : "Click the photos you want, then submit your folder. You cannot change it after submission."}</p>
    {error && <p role="alert" className="my-3 text-rose-600">{error}</p>}
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{album.photos.map(photo => <button key={photo.id} type="button" aria-pressed={ids.has(photo.id)} disabled={submitted || busy} className={`overflow-hidden rounded-xl border bg-white text-left ${ids.has(photo.id) ? "ring-4 ring-sky-500" : ""}`} onClick={() => setIds(current => { const next = new Set(current); if (next.has(photo.id)) next.delete(photo.id); else next.add(photo.id); return next; })}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photo.imageUrl} alt={photo.name} className="aspect-square w-full object-cover" /><span className="block truncate p-2 text-xs">{ids.has(photo.id) ? "✓ " : ""}{photo.name}</span>
    </button>)}</div>
    <div className="sticky bottom-3 mt-6 flex items-center justify-between rounded-xl border bg-white p-4 shadow-lg"><span>{ids.size} selected</span><Button disabled={submitted || busy || !ids.size} onClick={submit}>{submitted ? "Submitted" : busy ? "Submitting…" : "Submit selection"}</Button></div>
  </div></main>;
}
