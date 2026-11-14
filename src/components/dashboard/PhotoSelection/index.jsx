"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Calendar, Check, ChevronRight, Clock, Copy, Download, Edit3, Heart, ImagePlus, Images, Lock, Mail, Search, Send, Share2, Sparkles, Target, Trash2, Unlock, UploadCloud, User } from "lucide-react";
import PagePanel from "@/components/dashboard/_builder/PagePanel";
import { useDashboardTheme } from "@/lib/dashboard/ThemeProvider";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/cn";
import { formatSelectionDate, selectionPanel, selectionStage, selectionStatus } from "./_builder/panel";
import { deleteAlbum } from "@/lib/photo-selection/store";
import { downloadOriginals } from "@/lib/photo-selection/originals";

const STAGES = ["All", "Draft", "Uploaded", "InProgress", "Locked", "Unlocked"];
const STAGE_LABEL = { All: "All", Draft: "Draft", Uploaded: "Uploaded", InProgress: "In Progress", Locked: "Locked", Unlocked: "Unlocked" };

export default function PhotoSelection({ albums = [], error = null }) {
  const { isDark } = useDashboardTheme();
  const router = useRouter();
  const status = error ? "error" : "ready";
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState("All");
  const count = albums.length;
  const counts = useMemo(() => Object.fromEntries(STAGES.map((item) => [item, item === "All" ? albums.length : albums.filter((album) => selectionStage(album) === item).length])), [albums]);
  const visibleAlbums = albums.filter((album) => {
    const haystack = `${album.folderName} ${album.clientName} ${album.phone || ""} ${album.whatsapp || ""} ${album.eventDate || ""}`.toLowerCase();
    return haystack.includes(query.trim().toLowerCase()) && (stage === "All" || selectionStage(album) === stage);
  });
  const draft = albums.find((album) => album.status === "draft");

  return (
    <PagePanel
      title="Client Photo Galleries"
      description="Create, customize selection rules, upload photos, and share client proofing galleries"
      actions={
        <Link href={ROUTES.dashboardPhotoSelectionNew} prefetch={false} className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-amber-600/30 hover:bg-amber-500">
          <ImagePlus className="size-4" />
          Create New Gallery
        </Link>
      }
    >
      {status === "error" ? (
        <div className={cn("rounded-2xl border px-5 py-8 text-center text-sm", isDark ? "border-rose-400/30 bg-rose-500/10 text-rose-100" : "border-rose-200/80 bg-rose-50/80 text-rose-700")}>
          <p>{error}</p>
          <button type="button" onClick={() => router.refresh()} className="mt-3 font-semibold underline">Try again</button>
        </div>
      ) : null}

      {status === "ready" && count === 0 ? (
        <div className={cn(selectionPanel(isDark), "border-dashed px-5 py-12 text-center")}>
          <span className={cn("mx-auto grid size-12 place-items-center rounded-2xl", isDark ? "bg-white/10 text-amber-200" : "bg-white/70 text-amber-700")}><Images className="size-5" /></span>
          <p className={cn("mt-4 font-serif text-lg font-bold", isDark ? "text-white" : "text-stone-900")}>No Galleries Found</p>
          <p className={cn("mx-auto mt-1 max-w-sm text-xs", isDark ? "text-stone-300" : "text-stone-500")}>Launch your first gallery using the step-by-step creation wizard.</p>
        </div>
      ) : null}

      {status === "ready" && draft && stage !== "Draft" ? (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
          <div className="flex items-center gap-2.5">
            <div className="grid size-8 shrink-0 place-items-center rounded-xl bg-amber-500/20 text-amber-600"><Clock className="size-4" /></div>
            <div>
              <p className="text-xs font-bold text-amber-900">Unfinished Draft: {draft.folderName} ({draft.clientName || "Client"})</p>
              <p className="text-[11px] text-amber-700">Last edited on Step {draft.wizardStep || 1}. Pick up right where you left off.</p>
            </div>
          </div>
          <Link href={setupHref(draft)} className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-amber-600 px-3 py-1.5 text-xs font-bold text-white">Resume Setup <ArrowRight className="size-3.5" /></Link>
        </div>
      ) : null}

      {status === "ready" && count > 0 ? (
        <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-stone-200/80 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute top-2.5 left-3 size-4 text-stone-400" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by client, event name, or phone..." className="w-full rounded-xl border border-stone-200 bg-stone-50 py-1.5 pr-3 pl-9 text-xs outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
          <div className="flex gap-1 overflow-x-auto">
            {STAGES.map((item) => (
              <button key={item} type="button" onClick={() => setStage(item)} className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium whitespace-nowrap ${stage === item ? "bg-amber-600 text-white shadow-sm" : "text-stone-600 hover:bg-stone-100"}`}>
                {STAGE_LABEL[item]}
                <span className={`rounded-full px-1.5 font-mono text-[10px] font-bold ${stage === item ? "bg-black/25 text-white" : "bg-stone-200/80 text-stone-700"}`}>{counts[item] || 0}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {status === "ready" && count > 0 && visibleAlbums.length === 0 ? <p className="rounded-2xl border border-dashed border-stone-300 bg-white px-5 py-10 text-center text-sm text-stone-500">No galleries match your current filter.</p> : null}

      {status === "ready" && visibleAlbums.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {visibleAlbums.map((album) => <GalleryCard key={album.id} album={album} onDeleted={() => router.refresh()} />)}
        </div>
      ) : null}
    </PagePanel>
  );
}

function setupHref(album, step) {
  const next = step || (Number(album.wizardStep) > 1 ? album.wizardStep : 2);
  return `${ROUTES.dashboardPhotoSelectionNew}?album=${album.id}&step=${next}`;
}

function phoneLabel(album) {
  const digits = String(album.whatsapp || album.phone || "").replace(/\D/g, "");
  const local = digits.length > 10 ? digits.slice(-10) : digits;
  if (local.length !== 10) return "";
  return `+91 ${local.slice(0, 5)} ${local.slice(5)}`;
}

function eventLabel(value) {
  if (!value) return "Date not set";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "Date not set";
  return date.toLocaleDateString("en-US", { month: "long", day: "2-digit", year: "numeric" });
}

function GalleryCard({ album, onDeleted }) {
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const locked = album.status === "selected";
  const stage = selectionStage(album);
  const folderStatus = selectionStatus(album);
  const rulesConfigured = Boolean(album.rules?.rulesConfigured);
  const totalPhotos = album.photoCount || 0;
  const canShare = totalPhotos > 0 && rulesConfigured && album.status !== "draft";
  const mode = album.rules?.selectionMode;
  const targetCount = !rulesConfigured ? totalPhotos : mode === "FIXED" ? Number(album.rules?.requiredPhotos || 0) : mode === "MIN_EXTRA" ? Number(album.rules?.includedPhotos || 0) : totalPhotos;
  const percentage = targetCount > 0 ? Math.round(((album.selectedCount || 0) / targetCount) * 100) : 0;
  const galleryUrl = typeof window === "undefined" ? "" : `${window.location.origin}/photo-selection/${album.shareToken}`;
  const phone = phoneLabel(album);
  const badge = stage === "Locked"
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : stage === "Unlocked"
      ? "border-rose-200 bg-rose-50 text-rose-700"
      : stage === "InProgress"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : stage === "Uploaded"
          ? "border-blue-200 bg-blue-50 text-blue-700"
          : "border-stone-200 bg-stone-100 text-stone-700";

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(galleryUrl);
      setCopied(true);
      toast.success("Gallery link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy the link.");
    }
  }

  function shareBlocked() {
    toast.warning(totalPhotos === 0 ? "Upload photos first." : album.status === "draft" ? "Publish the gallery before sharing." : "Configure selection rules first.");
  }

  async function downloadSelected() {
    if (!window.showDirectoryPicker) {
      toast.error("This browser cannot choose a folder for the ZIP.");
      return;
    }
    let directory;
    try {
      directory = await window.showDirectoryPicker({ mode: "read", id: "rd-flip-selection-originals" });
    } catch (error) {
      if (error?.name !== "AbortError") toast.error(error?.message || "Could not open the original folder.");
      return;
    }
    setDownloading(true);
    try {
      await downloadOriginals(album, Promise.resolve(directory));
      toast.success("Selected photos downloaded.");
    } catch (error) {
      toast.error(error.message || "Could not download the selected photos.");
    } finally {
      setDownloading(false);
    }
  }

  function openWhatsApp() {
    const digits = String(album.whatsapp || album.phone || "").replace(/\D/g, "");
    const text = encodeURIComponent(`Your photo selection gallery is ready.\n${galleryUrl}\nCode: ${album.accessCode}`);
    window.open(digits ? `https://api.whatsapp.com/send?phone=${digits}&text=${text}` : `https://api.whatsapp.com/send?text=${text}`, "_blank");
  }

  return (
    <article className="flex flex-col justify-between rounded-xl border border-stone-200/80 bg-white p-4 text-stone-900 shadow-sm transition hover:border-amber-300">
      <div>
        <div className="mb-2 flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${badge}`}>
              {stage === "Locked" ? <Lock className="size-3" /> : stage === "Unlocked" ? <Unlock className="size-3" /> : <span className={`size-1.5 rounded-full ${stage === "InProgress" ? "animate-pulse bg-amber-500" : stage === "Uploaded" ? "bg-blue-500" : "bg-stone-400"}`} />}
              {folderStatus.label}
            </span>
            {rulesConfigured ? (
              <span className="rounded-md border border-stone-200 bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-stone-600">{mode === "FIXED" ? `Fixed: ${album.rules.requiredPhotos}` : mode === "MIN_EXTRA" ? `Included: ${album.rules.includedPhotos}+` : "Unlimited"}</span>
            ) : (
              <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">No Target Set</span>
            )}
          </div>
          <span className="shrink-0 font-mono text-[10px] text-stone-400">{formatSelectionDate(album.createdAt)}</span>
        </div>

        <Link href={ROUTES.dashboardPhotoSelectionView(album.id)} prefetch={false} className="mb-1.5 flex items-center gap-1.5 truncate font-serif text-base font-bold hover:text-amber-700">
          <Heart className="size-3.5 shrink-0 fill-rose-500/20 text-rose-500" />
          <span className="truncate">{album.folderName}</span>
        </Link>
        <div className="mb-2.5 space-y-1 text-xs text-stone-600">
          <p className="flex items-center gap-1.5 truncate"><User className="size-3.5 shrink-0 text-stone-400" /><span className="truncate font-medium text-stone-800">{album.clientName || "Couple"}</span>{phone ? <span className="shrink-0 font-mono text-[11px] text-stone-400">({phone})</span> : null}</p>
          <p className="flex items-center gap-1.5"><Calendar className="size-3.5 shrink-0 text-stone-400" />{eventLabel(album.eventDate)}</p>
          {album.selectionDeadline ? <p className="flex items-center gap-1.5 text-[11px] font-medium text-amber-700"><Clock className="size-3.5 text-amber-500" />Deadline: {eventLabel(album.selectionDeadline)}</p> : null}
        </div>

        <div className="mb-2.5 rounded-lg border border-stone-100 bg-stone-50 p-2.5">
          <div className="mb-1 flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1.5 font-medium text-stone-700"><Heart className="size-3 fill-rose-500 text-rose-500" />Selected: <strong>{album.selectedCount || 0}</strong>{rulesConfigured && mode === "FIXED" ? <span className="text-stone-500"> / {album.rules.requiredPhotos} target</span> : rulesConfigured && mode === "MIN_EXTRA" ? <span className="text-stone-500"> / {album.rules.includedPhotos} included</span> : totalPhotos > 0 ? <span className="text-stone-500"> / {totalPhotos} photos</span> : <span className="text-stone-400"> • Rules pending</span>}</span>
            <span className="font-semibold text-stone-900">{targetCount > 0 ? `${percentage}%` : "—"}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-stone-200"><div className={`h-full rounded-full ${stage === "Locked" ? "bg-emerald-500" : "bg-amber-500"}`} style={{ width: `${Math.min(100, percentage)}%` }} /></div>
        </div>

        {canShare ? (
          <div className="mb-2 flex items-center gap-1 rounded-lg border border-stone-200/60 bg-stone-100/80 p-1">
            <button type="button" onClick={openWhatsApp} className="flex flex-1 items-center justify-center gap-1 rounded bg-emerald-600 px-1.5 py-1 text-[11px] font-bold text-white"><Send className="size-3" />WhatsApp</button>
            <a href={`mailto:${album.clientEmail || ""}?subject=${encodeURIComponent(`Photo selection gallery - ${album.folderName}`)}&body=${encodeURIComponent(`${galleryUrl}\nCode: ${album.accessCode}`)}`} className="flex flex-1 items-center justify-center gap-1 rounded bg-sky-600 px-1.5 py-1 text-[11px] font-bold text-white"><Mail className="size-3" />Email</a>
            <button type="button" onClick={copyLink} className="flex items-center gap-1 rounded border border-stone-200 bg-white px-2 py-1 text-[11px] font-semibold text-stone-700">{copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}{copied ? "Copied" : "Link"}</button>
          </div>
        ) : (
          <div className="mb-2 flex items-center justify-between rounded-lg border border-stone-200/70 bg-stone-100/90 px-2.5 py-1.5 text-xs">
            {totalPhotos === 0 ? (
              <>
                <span className="flex items-center gap-1 text-[11px] font-medium text-stone-500"><UploadCloud className="size-3.5 text-amber-500" />Photos pending upload</span>
                <Link href={album.status === "draft" ? setupHref(album, 2) : ROUTES.dashboardPhotoSelectionView(album.id)} className="rounded bg-amber-600 px-2 py-0.5 text-[10px] font-bold text-white">Upload Photos</Link>
              </>
            ) : !rulesConfigured ? (
              <>
                <span className="flex items-center gap-1 text-[11px] font-bold text-amber-800"><Target className="size-3.5 animate-pulse text-amber-600" />Configure Rules (3 Options)</span>
                <Link href={album.status === "draft" ? setupHref(album, 3) : ROUTES.dashboardPhotoSelectionView(album.id)} className="rounded bg-amber-600 px-2 py-0.5 text-[10px] font-bold text-white">Configure Rules →</Link>
              </>
            ) : (
              <>
                <span className="text-[11px] font-medium text-stone-500">Ready to publish</span>
                <Link href={setupHref(album, 5)} className="rounded bg-amber-600 px-2 py-0.5 text-[10px] font-bold text-white">Review & Publish</Link>
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-stone-100 pt-3">
        <div className="flex items-center gap-1">
          {album.status === "draft" ? (
            <Link href={setupHref(album)} className="inline-flex items-center gap-1 rounded-lg border border-amber-500/30 bg-amber-500/15 px-2.5 py-1.5 text-xs font-bold text-amber-700"><Sparkles className="size-3.5" />Resume</Link>
          ) : (
            <Link href={ROUTES.dashboardPhotoSelectionView(album.id)} className="rounded-lg p-1.5 text-stone-600 hover:bg-stone-100 hover:text-amber-700" aria-label="Open gallery details"><Edit3 className="size-4" /></Link>
          )}
          <button type="button" onClick={canShare ? copyLink : shareBlocked} className={`rounded-lg p-1.5 ${canShare ? "text-stone-600 hover:bg-stone-100 hover:text-amber-700" : "text-stone-300"}`} aria-label="Share gallery"><Share2 className="size-4" /></button>
          {confirmDelete ? (
            <button type="button" disabled={deleting} onClick={async () => { setDeleting(true); try { await deleteAlbum(album.id); toast.success("Gallery deleted"); onDeleted(); } catch (error) { toast.error(error.message || "Could not delete the gallery."); setDeleting(false); setConfirmDelete(false); } }} className="rounded-lg px-2 py-1 text-[11px] font-bold text-rose-600 hover:bg-rose-50">{deleting ? "Deleting…" : "Delete?"}</button>
          ) : (
            <button type="button" onClick={() => setConfirmDelete(true)} className="rounded-lg p-1.5 text-stone-500 hover:bg-rose-50 hover:text-rose-600" aria-label="Delete gallery"><Trash2 className="size-4" /></button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {locked ? <button type="button" disabled={downloading || !(album.selectedCount > 0)} onClick={downloadSelected} className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 disabled:opacity-50"><Download className="size-3.5" />{downloading ? "Downloading…" : "Download"}</button> : null}
          <Link href={ROUTES.dashboardPhotoSelectionView(album.id)} className="inline-flex items-center gap-1 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-amber-500">Open <ChevronRight className="size-3.5" /></Link>
        </div>
      </div>
    </article>
  );
}
