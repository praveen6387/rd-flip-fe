"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { BookOpen, Calendar, Camera, CheckCircle2, Heart, IndianRupee, KeyRound, Loader2, Lock, MessageCircle, MessageSquare, Sparkles, User, Users, X } from "lucide-react";
import { confirmPublicSelection, getPublicAlbum, syncPublicSelection, togglePublicPhoto, updatePublicPhoto } from "@/lib/photo-selection/store";
import { grantedSelection, grantSelection } from "@/lib/photo-selection/grant";
import { clientSelectBlock, selectionQuote, selectionRuleText } from "@/lib/photo-selection/rules";
import GalleryPhotoCard from "../Gallery/PhotoCard";
import GalleryFilterBar from "../Gallery/FilterBar";
import GalleryFloatingBar from "../Gallery/FloatingBar";
import GalleryLightbox from "../Gallery/Lightbox";
import NexpicCanvas from "../_builder/NexpicCanvas";

function projectFrom(album) {
  const rules = album?.rules || {};
  return {
    title: album?.folderName,
    clientName: album?.clientName,
    selectionMode: rules.selectionMode || "UNLIMITED",
    requiredPhotos: rules.requiredPhotos,
    includedPhotos: rules.includedPhotos,
    photosPerSheet: rules.photosPerSheet || 4,
    includedSheets: rules.includedSheets,
    extraSheetPrice: rules.extraSheetPrice || 0,
    allowExtraPhotos: rules.allowExtraPhotos !== false,
    isLocked: album?.status === "selected",
  };
}

function photoFrom(photo) {
  return { ...photo, originalFilename: photo.name, thumbnailUrl: photo.imageUrl, isSelected: Boolean(photo.selected) };
}

function studioNotice(album) {
  const rules = album?.rules || {};
  const studioName = album?.studio?.studioName || "Studio";
  const digits = String(album?.studio?.phone || "").replace(/\D/g, "");
  const phone = digits.length === 10 ? `91${digits}` : digits;
  const selectedCount = album?.selectedCount || 0;
  const photosPerSheet = Number(rules.photosPerSheet) > 0 ? Number(rules.photosPerSheet) : 4;
  const totalSheets = Number(rules.estimatedSheets) || Math.ceil(selectedCount / photosPerSheet);
  const extraSheets = Number(rules.extraSheets) || 0;
  const extraCharge = Number(rules.extraSheetCharge || rules.totalExtraCharge) || 0;
  const clientName = album?.clientName || "Client";
  const confirmedBy = rules.confirmedByName || clientName;
  let message = `Hello ${studioName},\n\nOur photo selection is complete.\n\n`;
  message += `📸 *Gallery:* ${album?.folderName || "Wedding Album"}\n`;
  message += `👤 *Client name:* ${clientName}\n`;
  message += `✍️ *Confirmed by:* ${confirmedBy}\n`;
  message += `📷 *Photos selected:* ${selectedCount}\n`;
  message += `📖 *Album sheets:* ${totalSheets} (${photosPerSheet} photos per sheet)\n`;
  if (rules.selectionMode === "MIN_EXTRA" && extraSheets > 0) {
    message += `➕ *Extra sheets:* +${extraSheets} (extra charge: ₹${extraCharge})\n`;
  }
  message += `\nThe final selection is locked. Please prepare the album.`;
  const url = phone
    ? `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`
    : `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
  return { url, phone: phone || "Studio", studioName, clientName, confirmedBy, selectedCount, totalSheets, photosPerSheet, extraSheets, extraCharge, mode: rules.selectionMode };
}

function lockedAt(value) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function ConfirmLock({ album, name, notes, error, busy, onName, onNotes, onClose, onSubmit }) {
  const rules = album?.rules || {};
  const mode = rules.rulesConfigured === false ? "UNLIMITED" : (rules.selectionMode || "UNLIMITED");
  const selectedCount = album?.selectedCount || 0;
  const total = album?.photoCount || 0;
  const quote = selectionQuote(rules, selectedCount, total);
  const photosPerSheet = Math.max(1, Number(rules.photosPerSheet || 4));
  const required = total > 0 && rules.requiredPhotos ? Math.min(Number(rules.requiredPhotos), total) : Number(rules.requiredPhotos || 0);
  const included = Number(rules.includedPhotos || 0);
  const extraPhotos = quote.extraPhotos || 0;
  const extraSheets = quote.extraSheets || 0;
  const photoPrice = Number(rules.extraPhotoPrice || 0);
  const sheetPrice = Number(rules.extraSheetPrice || 0);
  const photoCharge = mode === "MIN_EXTRA" && rules.enableExtraPhotoPricing ? extraPhotos * photoPrice : 0;
  const sheetCharge = mode === "MIN_EXTRA" && rules.enableExtraSheetPricing ? extraSheets * sheetPrice : 0;
  const tags = [...new Set([album?.clientName, "Groom", "Bride", "Father", "Family Member"].map((tag) => String(tag || "").trim()).filter(Boolean))];
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-stone-950/70 p-4">
      <form onSubmit={onSubmit} className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-2xl bg-white p-6 text-stone-900">
        <h2 className="font-heading text-xl font-bold">Confirm final photo selection</h2>
        <p className="mt-1 text-xs text-stone-500">Finalize your choices for album printing and design.</p>
        <div className="mt-4 flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-950">
          <Lock className="mt-0.5 size-4 shrink-0 text-amber-600" />
          <p><strong>Your selections will be permanently locked.</strong> Once confirmed, the final choices are sent to the studio.</p>
        </div>
        <div className="mt-4 space-y-1.5 rounded-xl border border-stone-200 bg-stone-50 p-4 text-xs">
          <h3 className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-stone-500 uppercase"><Sparkles className="size-3.5 text-amber-500" />Your final selection summary</h3>
          <div className="flex justify-between border-b border-stone-200 py-1"><span className="text-stone-500">Selected photos</span><span className="font-bold text-rose-600">{selectedCount}</span></div>
          {mode === "FIXED" ? <div className="flex justify-between border-b border-stone-200 py-1"><span className="text-stone-500">Required selection</span><span className="font-bold">{required}</span></div> : null}
          {mode === "MIN_EXTRA" ? <div className="flex justify-between border-b border-stone-200 py-1"><span className="text-stone-500">Included in package</span><span className="font-bold">{included}</span></div> : null}
          {mode === "MIN_EXTRA" ? <div className="flex justify-between border-b border-stone-200 py-1"><span className="text-stone-500">Extra photos</span><span className={`font-bold ${extraPhotos ? "text-amber-600" : "text-stone-500"}`}>{extraPhotos ? `+${extraPhotos}` : "0"}</span></div> : null}
          <div className="flex justify-between border-b border-stone-200 py-1"><span className="flex items-center gap-1 text-stone-500"><BookOpen className="size-3 text-amber-500" />Estimated album sheets</span><span className="font-bold">{quote.estimatedSheets} sheets ({photosPerSheet} photos/sheet)</span></div>
          {mode === "FIXED" ? <div className="flex justify-between border-b border-stone-200 py-1"><span className="text-stone-500">Target album sheets</span><span className="font-bold">{quote.includedSheets} sheets</span></div> : null}
          {mode === "MIN_EXTRA" ? <div className="flex justify-between border-b border-stone-200 py-1"><span className="text-stone-500">Included album sheets</span><span className="font-bold">{quote.includedSheets || 0} sheets</span></div> : null}
          {mode === "MIN_EXTRA" && extraSheets > 0 ? <div className="flex justify-between border-b border-stone-200 py-1"><span className="text-stone-500">Estimated extra sheets</span><span className="font-bold text-amber-600">+{extraSheets} sheets</span></div> : null}
          {photoCharge + sheetCharge > 0 ? (
            <div className="space-y-1 rounded-lg border border-amber-200 bg-amber-50 p-2.5">
              {photoCharge > 0 ? <div className="flex justify-between"><span>Extra photos ({extraPhotos} × ₹{photoPrice})</span><span>₹{photoCharge}</span></div> : null}
              {sheetCharge > 0 ? <div className="flex justify-between"><span>Extra sheets ({extraSheets} × ₹{sheetPrice})</span><span>₹{sheetCharge}</span></div> : null}
              <div className="flex justify-between border-t border-amber-200 pt-1 font-bold"><span className="flex items-center gap-1"><IndianRupee className="size-3" />Estimated extra charge</span><span>₹{photoCharge + sheetCharge}</span></div>
            </div>
          ) : null}
        </div>
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/70 p-3">
          <label className="flex items-center gap-1.5 text-xs font-bold" htmlFor="confirm-name"><User className="size-3.5 text-amber-600" />Confirmed by / your name <span className="text-rose-600">*</span></label>
          <input id="confirm-name" value={name} onChange={(event) => onName(event.target.value)} placeholder="For example, groom, bride, or a family member" className="mt-2 w-full rounded-xl border border-amber-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-500" />
          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px] text-stone-500">Quick select: {tags.map((tag) => <button key={tag} type="button" onClick={() => onName(tag)} className="rounded-md border border-stone-200 bg-white px-2 py-0.5 font-semibold text-stone-700">+ {tag}</button>)}</div>
          <p className="mt-1 text-[10px] text-stone-500">This name is saved with the studio as the person who confirmed the album.</p>
        </div>
        <label className="mt-4 block text-xs font-semibold tracking-wider text-stone-600 uppercase" htmlFor="confirm-notes">Special album notes (optional)</label>
        <div className="relative mt-1.5"><MessageSquare className="absolute top-3 left-3 size-4 text-stone-400" /><textarea id="confirm-notes" rows={2} value={notes} onChange={(event) => onNotes(event.target.value)} placeholder="For example, use a photo as the album cover." className="w-full resize-none rounded-xl border border-stone-200 bg-stone-50 py-2 pr-3 pl-9 text-sm outline-none focus:ring-2 focus:ring-amber-500" /></div>
        {error ? <p role="alert" className="mt-3 text-sm text-rose-600">{error}</p> : null}
        <div className="mt-4 flex flex-col-reverse gap-2 border-t border-stone-100 pt-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="rounded-xl border px-4 py-2.5 text-xs font-semibold">Back to selection</button>
          <button type="submit" disabled={busy} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white disabled:opacity-50">{busy ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}{busy ? "Locking selections…" : "Confirm final selection"}</button>
        </div>
      </form>
    </div>
  );
}

function SelectionConfirmed({ album, onClose }) {
  const notice = studioNotice(album);
  const when = lockedAt(album?.submittedAt);
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-stone-950/70 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center text-stone-900">
        <div className="relative mx-auto grid size-14 place-items-center rounded-2xl bg-emerald-600 text-2xl text-white">🎉<Lock className="absolute -right-1 -bottom-1 size-5 rounded-full bg-emerald-500 p-0.5" /></div>
        <h2 className="mt-3 font-heading text-2xl font-bold">Selection Confirmed!</h2>
        <p className="mt-1 flex items-center justify-center gap-1 text-xs font-semibold text-emerald-600"><Lock className="size-3.5" />Final album selection locked</p>
        <p className="mt-2 text-xs text-stone-600">Thank you, <strong className="text-stone-900">{notice.clientName}</strong>. Your final selection has been sent to the studio.</p>
        <div className="mt-4 space-y-2 rounded-xl border border-stone-200 bg-stone-50 p-3.5 text-left text-xs">
          <div className="flex items-center justify-between"><span className="flex items-center gap-1.5 text-stone-500"><Heart className="size-3.5 fill-rose-500 text-rose-500" />Total photos selected</span><span className="font-bold text-rose-600">{notice.selectedCount} Photos</span></div>
          <div className="flex items-center justify-between border-t border-stone-200 pt-2"><span className="flex items-center gap-1.5 text-stone-500"><BookOpen className="size-3.5 text-amber-600" />Total album sheets</span><span className="font-bold">{notice.totalSheets} Sheets ({notice.photosPerSheet}/sheet)</span></div>
          {notice.mode === "MIN_EXTRA" && notice.extraSheets > 0 ? <div className="flex items-center justify-between rounded-lg bg-amber-50 px-2 py-1.5 font-semibold text-amber-900"><span className="flex items-center gap-1"><IndianRupee className="size-3.5" />Extra sheets (+{notice.extraSheets})</span><span>₹{notice.extraCharge}</span></div> : null}
          <div className="flex items-center justify-between border-t border-stone-200 pt-2"><span className="flex items-center gap-1.5 font-semibold text-stone-500"><User className="size-3.5 text-amber-600" />Confirmed by</span><span className="font-bold">{notice.confirmedBy}</span></div>
          {when ? <div className="flex items-center justify-between border-t border-stone-200 pt-2 text-[11px] text-stone-400"><span className="flex items-center gap-1"><Calendar className="size-3" />Submitted</span><span>{when}</span></div> : null}
        </div>
        <a href={notice.url} target="_blank" rel="noreferrer" className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white"><MessageCircle className="size-4" />Notify the studio on WhatsApp ({notice.phone})</a>
        <button type="button" onClick={onClose} className="mt-2 w-full rounded-xl bg-stone-100 px-4 py-2 text-xs font-semibold text-stone-700">Continue browsing gallery</button>
      </div>
    </div>
  );
}

export default function ClientSelection({ token }) {
  const [phase, setPhase] = useState("check");
  const [album, setAlbum] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [code, setCode] = useState("");
  const [access, setAccess] = useState(null);
  const [category, setCategory] = useState("All");
  const [subfolder, setSubfolder] = useState("All");
  const [status, setStatus] = useState("all");
  const [query, setQuery] = useState("");
  const [extraAllowed, setExtraAllowed] = useState(false);
  const [pendingPhoto, setPendingPhoto] = useState(null);
  const [extraOpen, setExtraOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [confirmName, setConfirmName] = useState("");
  const [confirmNotes, setConfirmNotes] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [openPhoto, setOpenPhoto] = useState(null);
  const pending = useRef(new Set());
  const pendingMarks = useRef(new Map());
  const sawLock = useRef(false);

  function showAlbum(next, nextAccess) {
    sawLock.current = next?.status === "selected";
    setAlbum(next);
    setConfirmName(next.clientName || "");
    setAccess(nextAccess);
    setPhase("photos");
  }

  useEffect(() => {
    let active = true;
    (async () => {
      const linked = new URLSearchParams(window.location.search).get("code")?.replace(/\D/g, "").slice(0, 6) || "";
      if (linked.length === 6) {
        try {
          const response = await fetch("/api/photo-selection/access/", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: linked }) });
          const result = await response.json().catch(() => null);
          if (!response.ok || result?.data?.shareToken !== token) throw new Error("This code does not match this gallery.");
          grantSelection(token, linked);
          window.history.replaceState(null, "", window.location.pathname);
          const next = await getPublicAlbum(token, { code: linked });
          if (active) showAlbum(next, { code: linked });
          return;
        } catch {
          window.history.replaceState(null, "", window.location.pathname);
        }
      }
      const grant = grantedSelection();
      if (grant?.token === token && grant.code) {
        try {
          const next = await getPublicAlbum(token, { code: grant.code });
          if (active) showAlbum(next, { code: grant.code });
          return;
        } catch { /* ask for the code again */ }
      }
      if (active) setPhase("code");
    })();
    return () => { active = false; };
  }, [token]);

  useEffect(() => {
    if (phase !== "photos" || !access) return undefined;
    const timer = setInterval(async () => {
      try {
        const sync = await syncPublicSelection(token, access);
        if (sync.isLocked) {
          if (!sawLock.current) {
            sawLock.current = true;
            setConfirmOpen(false);
            setReviewOpen(false);
            setExtraOpen(false);
            setAlbum(await getPublicAlbum(token, access));
          }
          return;
        }
        setAlbum((current) => {
          if (!current) return current;
          const chosen = new Set(sync.selectedPhotoIds || []);
          const photos = current.photos.map((photo) => {
            if (pending.current.has(photo.id)) return photo;
            const meta = sync.selectionsMeta?.[photo.id];
            const selected = chosen.has(photo.id);
            return { ...photo, selected, rating: selected ? (meta?.rating || 0) : photo.rating, coverType: selected ? (meta?.coverType || null) : photo.coverType, notes: selected ? (meta?.notes || "") : photo.notes };
          });
          return { ...current, selectedCount: photos.filter((photo) => photo.selected).length, photos };
        });
      } catch { /* keep the last gallery */ }
    }, 2500);
    return () => clearInterval(timer);
  }, [phase, access, token]);

  async function unlock(event) {
    event.preventDefault();
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/photo-selection/access/", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code }) });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.data?.shareToken) throw new Error(response.status === 429 ? "Too many attempts. Please wait a minute and try again." : result?.message || "Could not open photo selection.");
      if (result.data.shareToken !== token) throw new Error("This code does not match this folder.");
      grantSelection(token, code);
      showAlbum(await getPublicAlbum(token, { code }), { code });
    } catch (unlockError) { setError(unlockError.message); } finally { setBusy(false); }
  }

  function paintPhoto(photoId, patch, coverType) {
    setAlbum((current) => {
      if (!current) return current;
      const photos = current.photos.map((photo) => {
        if (coverType === "FRONT" && photo.coverType === "FRONT" && photo.id !== photoId) return { ...photo, coverType: null };
        if (coverType === "BACK" && photo.coverType === "BACK" && photo.id !== photoId) return { ...photo, coverType: null };
        if (photo.id !== photoId) return photo;
        return { ...photo, ...patch };
      });
      return { ...current, selectedCount: photos.filter((photo) => photo.selected).length, photos };
    });
  }

  function hold(photoId) {
    const mark = {};
    pending.current.add(photoId);
    pendingMarks.current.set(photoId, mark);
    setTimeout(() => {
      if (pendingMarks.current.get(photoId) === mark) {
        pending.current.delete(photoId);
        pendingMarks.current.delete(photoId);
      }
    }, 1200);
  }

  async function persist(photo, selected) {
    const previous = album;
    hold(photo.id);
    setSaving(true);
    setError("");
    paintPhoto(photo.id, { selected });
    try {
      const result = await togglePublicPhoto(token, photo.id, selected, access);
      paintPhoto(photo.id, { selected: result.selected, rating: result.rating || 0, coverType: result.coverType || null, notes: result.notes || "" });
    } catch (toggleError) {
      setAlbum(previous);
      setError(toggleError.message);
    } finally {
      setSaving(false);
    }
  }

  function choose(photo, nextSelected) {
    if (album.status === "selected") { setError("This gallery has been confirmed and locked. Selections cannot be changed unless reopened by your photographer."); return; }
    if (nextSelected) {
      const block = clientSelectBlock({ rules: album.rules, selectedCount: album.selectedCount, extraAllowed });
      if (block?.type === "extra") { setPendingPhoto(photo); setExtraOpen(true); return; }
      if (block?.type === "limit") { setError(block.message); return; }
    }
    persist(photo, nextSelected);
  }

  async function update(photo, details) {
    if (!photo || album.status === "selected") { setError("This gallery has been confirmed and locked. Selections cannot be changed unless reopened by your photographer."); return; }
    const previous = album;
    hold(photo.id);
    setSaving(true);
    setError("");
    paintPhoto(photo.id, { selected: true, ...details }, details.coverType);
    try {
      const result = await updatePublicPhoto(token, photo.id, details, access);
      paintPhoto(photo.id, { selected: result.selected, rating: result.rating || 0, coverType: result.coverType || null, notes: result.notes || "" }, details.coverType);
    } catch (detailError) {
      setAlbum(previous);
      setError(detailError.message);
    } finally {
      setSaving(false);
    }
  }

  async function confirmSelection(event) {
    event.preventDefault();
    const name = confirmName.trim();
    if (name.length < 2) {
      setConfirmError("Enter your name with at least 2 characters, then lock the selection.");
      return;
    }
    setBusy(true);
    setConfirmError("");
    setError("");
    try {
      setAlbum(await confirmPublicSelection(token, { confirmedByName: name, notes: confirmNotes }, access));
      setConfirmOpen(false);
      setSummaryOpen(true);
    } catch (failure) {
      setConfirmError(failure.message || "Could not lock the selection.");
    } finally {
      setBusy(false);
    }
  }

  const project = projectFrom(album);
  const photos = useMemo(() => (album?.photos || []).map(photoFrom), [album]);
  const categories = useMemo(() => [...new Set(photos.map((photo) => photo.category).filter(Boolean))], [photos]);
  const subfolders = useMemo(() => [...new Set(photos.filter((photo) => category === "All" || photo.category === category).map((photo) => photo.subfolder).filter(Boolean))], [photos, category]);
  const visible = photos.filter((photo) => {
    const matchesFolder = (category === "All" || photo.category === category) && (subfolder === "All" || photo.subfolder === subfolder);
    const matchesQuery = photo.originalFilename.toLowerCase().includes(query.trim().toLowerCase());
    const matchesStatus = status === "selected" ? photo.isSelected : status === "unselected" ? !photo.isSelected : status === "starred" ? photo.rating > 0 : status === "covers" ? Boolean(photo.coverType) : true;
    return matchesFolder && matchesQuery && matchesStatus;
  });
  const selectedPhotos = photos.filter((photo) => photo.isSelected);

  if (phase === "check") return <NexpicCanvas className="grid min-h-screen place-items-center font-heading text-stone-500">Opening gallery…</NexpicCanvas>;
  if (phase === "code") {
    return (
      <main className="grid min-h-screen place-items-center bg-stone-950/90 p-4">
        <form onSubmit={unlock} className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-2xl">
          <div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl border border-amber-200 bg-amber-50 text-amber-700"><KeyRound className="size-7" /></div>
          <h1 className="font-heading text-2xl font-bold text-stone-900">Private photo gallery</h1>
          <p className="mt-1 mb-6 text-xs text-stone-500">Enter the six-digit code from your studio.</p>
          <input id="selection-code" inputMode="numeric" autoComplete="off" pattern="[0-9]{6}" minLength={6} maxLength={6} required value={code} onChange={(event) => setCode(event.target.value.replace(/[^0-9]/g, "").slice(0, 6))} placeholder="Enter access code" className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-center font-mono text-lg tracking-[0.4em] text-stone-900 outline-none focus:ring-2 focus:ring-amber-500" />
          {error ? <p role="alert" className="mt-3 text-sm text-rose-600">{error}</p> : null}
          <button type="submit" disabled={busy || code.length !== 6} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-700 py-3 text-sm font-semibold text-white disabled:opacity-50">{busy ? <Loader2 className="size-4 animate-spin" /> : <Lock className="size-4" />}Unlock gallery</button>
        </form>
      </main>
    );
  }

  const locked = album.status === "selected";
  return (
    <NexpicCanvas className="min-h-screen pb-28 text-stone-900">
      <header className="border-b border-stone-200 bg-gradient-to-b from-stone-100/80 to-transparent">
        <div className="flex items-center justify-between border-b border-stone-200/70 bg-white/70 px-4 py-2.5 text-xs sm:px-8">
          <span className="font-heading text-sm font-bold tracking-wide">RD Flip · Client selection</span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-800"><span className="size-2 animate-ping rounded-full bg-emerald-400" /><Users className="size-3.5" />Live family sync</span>
        </div>
        <div className="mx-auto max-w-[1800px] px-4 py-6 sm:px-8">
          <p className="text-xs font-semibold tracking-[0.2em] text-amber-700 uppercase">{album.clientName}</p>
          <h1 className="font-heading text-3xl font-bold sm:text-4xl">{album.folderName}</h1>
          {album.welcomeMessage ? <p className="mt-2 max-w-2xl text-sm text-stone-600">{album.welcomeMessage}</p> : null}
          <p className="mt-2 max-w-2xl text-sm text-stone-600">{locked ? `Confirmed${album.rules?.confirmedByName ? ` by ${album.rules.confirmedByName}` : ""}. Ask the studio to reopen the gallery if something must change.` : selectionRuleText(album.rules)}</p>
        </div>
      </header>
      {error ? <p role="alert" className="mx-auto mt-4 max-w-[1800px] px-4 text-sm text-rose-600 sm:px-8">{error}</p> : null}
      <GalleryFilterBar categories={categories} category={category} onCategory={setCategory} subfolders={subfolders} subfolder={subfolder} onSubfolder={setSubfolder} status={status} onStatus={setStatus} selectedCount={album.selectedCount} totalCount={photos.length} starredCount={photos.filter((photo) => photo.rating > 0).length} coverCount={photos.filter((photo) => photo.coverType).length} query={query} onQuery={setQuery} />
      <main className="mx-auto max-w-[1800px] px-3 py-5 sm:px-6">
        {visible.length ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">{visible.map((photo) => <GalleryPhotoCard key={photo.id} photo={photo} locked={locked} watermark={album.watermark} onToggle={choose} onOpen={setOpenPhoto} />)}</div> : <div className="py-20 text-center"><Camera className="mx-auto mb-3 size-12 text-stone-300" /><h2 className="font-heading text-xl font-bold text-stone-700">No photographs found</h2><p className="mt-1 text-xs text-stone-400">Try another filter or clear the search.</p></div>}
      </main>
      {photos.length ? <GalleryFloatingBar project={project} rules={album.rules} selectedCount={album.selectedCount} totalCount={photos.length} saving={saving} locked={locked} onReview={() => setReviewOpen(true)} onConfirm={() => setConfirmOpen(true)} onSummary={() => setSummaryOpen(true)} /> : null}
      {openPhoto ? <GalleryLightbox photo={photos.find((item) => item.id === openPhoto.id) || openPhoto} photos={visible.length ? visible : photos} locked={locked} watermark={album.watermark} onClose={() => setOpenPhoto(null)} onNavigate={setOpenPhoto} onToggle={choose} onUpdate={update} /> : null}
      {extraOpen ? <div className="fixed inset-0 z-40 grid place-items-center bg-stone-950/70 p-4"><div className="w-full max-w-md rounded-2xl bg-white p-6 text-stone-900"><h2 className="font-heading text-xl font-bold">Extra photo selection notice</h2><p className="mt-2 text-sm text-stone-600">Your package includes {album.rules?.includedPhotos} photos. Photos after that are extra{album.rules?.extraSheetPrice ? ` at ₹${album.rules.extraSheetPrice} per sheet` : ""}.</p><div className="mt-5 grid grid-cols-2 gap-2"><button type="button" onClick={() => { setExtraOpen(false); setPendingPhoto(null); }} className="rounded-xl border px-3 py-2.5 text-sm font-bold"><X className="mr-1 inline size-4 text-rose-500" />Cancel</button><button type="button" onClick={() => { setExtraAllowed(true); setExtraOpen(false); if (pendingPhoto) persist(pendingPhoto, true); setPendingPhoto(null); }} className="rounded-xl bg-amber-700 px-3 py-2.5 text-sm font-bold text-white">Continue</button></div></div></div> : null}
      {reviewOpen ? <div className="fixed inset-0 z-40 grid place-items-center bg-stone-950/70 p-4"><div className="max-h-[80vh] w-full max-w-lg overflow-auto rounded-2xl bg-white p-6"><div className="flex items-center justify-between"><h2 className="font-heading text-xl font-bold">Review selected photos</h2><button type="button" onClick={() => setReviewOpen(false)} aria-label="Close"><X /></button></div><p className="mt-1 text-xs text-stone-500">You have chosen {selectedPhotos.length} photograph{selectedPhotos.length === 1 ? "" : "s"} for your album.</p><ul className="mt-4 space-y-2 text-sm">{selectedPhotos.map((photo) => <li key={photo.id} className="flex items-center justify-between gap-3 border-b border-stone-100 py-2"><span className="truncate">{photo.originalFilename}</span><span className="shrink-0 text-xs text-stone-500">{photo.rating ? `${photo.rating}★ ` : ""}{photo.coverType || ""}</span></li>)}</ul><div className="mt-4 flex justify-end gap-2 border-t border-stone-100 pt-3"><button type="button" onClick={() => setReviewOpen(false)} className="rounded-xl border px-4 py-2 text-xs font-semibold">Back to gallery</button>{!locked && selectedPhotos.length ? <button type="button" onClick={() => { setReviewOpen(false); setConfirmOpen(true); }} className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white"><CheckCircle2 className="size-4" />Proceed to final confirmation</button> : null}</div></div></div> : null}
      {confirmOpen && !summaryOpen ? <ConfirmLock album={album} name={confirmName} notes={confirmNotes} error={confirmError} busy={busy} onName={(value) => { setConfirmName(value); setConfirmError(""); }} onNotes={setConfirmNotes} onClose={() => { setConfirmOpen(false); setConfirmError(""); }} onSubmit={confirmSelection} /> : null}
      {summaryOpen ? <SelectionConfirmed album={album} onClose={() => setSummaryOpen(false)} /> : null}
    </NexpicCanvas>
  );
}
