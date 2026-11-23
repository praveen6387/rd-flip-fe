"use client";

import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Bell, Calendar, Check, ChevronRight, Clock, Copy, Download, Eye, EyeOff, ImagePlus, Images, KeyRound, Loader2, Mail, Phone, Search, Send, Sparkles, Target, Trash2, UploadCloud, User } from "lucide-react";
import PagePanel from "@/components/dashboard/_builder/PagePanel";
import { useDashboardTheme } from "@/lib/dashboard/ThemeProvider";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/cn";
import { formatSelectionDate, selectionPanel, selectionStage, selectionStatus, clientShareMessage } from "./_builder/panel";
import { deleteAlbum } from "@/lib/photo-selection/store";
import { downloadOriginals } from "@/lib/photo-selection/originals";
import { useAuth } from "@/components/auth";
import NexpicCanvas from "./_builder/NexpicCanvas";

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
    <NexpicCanvas bleed>
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
          <p className={cn("mt-4 font-sans text-lg font-bold", isDark ? "text-white" : "text-stone-900")}>No Galleries Found</p>
          <p className={cn("mx-auto mt-1 max-w-sm text-xs", isDark ? "text-stone-300" : "text-stone-500")}>Launch your first gallery using the step-by-step creation wizard.</p>
        </div>
      ) : null}

      {status === "ready" && (count > 0 || (draft && stage !== "Draft")) ? (
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
          {count > 0 ? (
            <div className="min-w-0 flex-1">
              <label className="relative block max-w-sm">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-[#b08968]" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search client, event, or phone" className="w-full rounded-xl border border-[#ead8c8] bg-white/90 py-2 pr-3 pl-9 text-xs text-stone-800 shadow-sm outline-none placeholder:text-[#c4a48a] focus:border-[#c5a059] focus:ring-2 focus:ring-[#c5a059]/30" />
              </label>
              <div className="mt-3 flex gap-1 overflow-x-auto border-b border-[#ead8c8]">
                {STAGES.map((item) => {
                  const active = stage === item;
                  return (
                    <button key={item} type="button" onClick={() => setStage(item)} className={`relative shrink-0 px-3 pt-1 pb-2 text-xs font-semibold whitespace-nowrap transition ${active ? "text-[#8f6834]" : "text-[#a08b7a] hover:text-[#3c2922]"}`}>
                      {STAGE_LABEL[item]}
                      <span className={`ml-1.5 text-[10px] font-bold tabular-nums ${active ? "text-[#c5a059]" : "text-[#c4a48a]"}`}>{counts[item] || 0}</span>
                      {active ? <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-gradient-to-r from-[#8f6834] to-[#c5a059]" /> : null}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
          {draft && stage !== "Draft" ? (
            <div role="status" aria-live="polite" className="flex w-full shrink-0 items-center gap-2.5 rounded-2xl border border-amber-400 bg-gradient-to-r from-amber-50 via-[#fff6ea] to-[#ffe7c2] px-3 py-2 shadow-[0_0_0_3px_rgba(245,158,11,0.16),0_12px_28px_-16px_rgba(180,83,9,0.55)] lg:mb-1 lg:w-auto lg:max-w-sm">
              <span className="relative grid size-8 shrink-0 place-items-center rounded-full bg-amber-500 text-white shadow-sm">
                <Bell className="size-3.5" />
                <span className="absolute -top-0.5 -right-0.5 flex size-2.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-rose-400 opacity-75" />
                  <span className="relative size-2.5 rounded-full bg-rose-500 ring-2 ring-amber-50" />
                </span>
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] leading-tight text-amber-950">
                  <span className="mr-1.5 inline-flex rounded-full bg-rose-500 px-1.5 py-px text-[9px] font-bold tracking-wide text-white uppercase">1 alert</span>
                  <span className="font-sans font-bold">{draft.folderName}</span>
                </p>
                <p className="truncate text-[11px] text-amber-800">Step {draft.wizardStep || 1} saved · {draft.clientName || "Client"}</p>
              </div>
              <Link href={setupHref(draft)} className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-amber-700 px-2.5 py-1.5 text-[11px] font-bold text-white shadow-sm">Resume <ArrowRight className="size-3" /></Link>
            </div>
          ) : null}
        </div>
      ) : null}

      {status === "ready" && count > 0 && visibleAlbums.length === 0 ? <p className="rounded-2xl border border-dashed border-stone-300 bg-white px-5 py-10 text-center text-sm text-stone-500">No galleries match your current filter.</p> : null}

      {status === "ready" && visibleAlbums.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {visibleAlbums.map((album) => <GalleryCard key={album.id} album={album} onDeleted={() => router.refresh()} />)}
        </div>
      ) : null}
    </PagePanel>
    </NexpicCanvas>
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
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [showCode, setShowCode] = useState(false);
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
  const statusDot = stage === "Locked" ? "bg-emerald-500" : stage === "Unlocked" ? "bg-rose-500" : stage === "InProgress" ? "bg-amber-500" : stage === "Uploaded" ? "bg-blue-500" : "bg-stone-400";

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

  async function removeGallery() {
    setDeleting(true);
    try {
      await deleteAlbum(album.id);
      toast.success("Gallery deleted");
      onDeleted();
    } catch (error) {
      toast.error(error.message || "Could not delete the gallery.");
      setDeleting(false);
    }
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
    const text = encodeURIComponent(clientShareMessage({ studioName: user?.studio_name, expiry: album.selectionDeadline, link: galleryUrl, pin: album.accessCode, welcome: album.welcomeMessage }));
    window.open(digits ? `https://api.whatsapp.com/send?phone=${digits}&text=${text}` : `https://api.whatsapp.com/send?text=${text}`, "_blank");
  }

  const modeLabel = !rulesConfigured ? "Not set" : mode === "FIXED" ? `Fixed ${album.rules.requiredPhotos}` : mode === "MIN_EXTRA" ? `Included ${album.rules.includedPhotos}+` : "Unlimited";
  const rows = [
    { label: "Status", value: folderStatus.label, icon: null },
    { label: "Mode", value: modeLabel, icon: Sparkles },
    { label: "Created", value: formatSelectionDate(album.createdAt), icon: Clock },
    { label: "Client", value: album.clientName || "Not set", icon: User },
    ...(phone ? [{ label: "Mobile", value: phone, icon: Phone }] : []),
    { label: "Event", value: eventLabel(album.eventDate), icon: Calendar },
    ...(album.selectionDeadline ? [{ label: "Deadline", value: eventLabel(album.selectionDeadline), icon: Clock, accent: true }] : []),
  ];

  return (
    <article className="flex flex-col justify-between overflow-hidden rounded-2xl border border-[#ead8c8] bg-white text-stone-900 shadow-[0_16px_40px_-24px_rgba(120,72,48,0.45)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_44px_-22px_rgba(120,72,48,0.55)]">
      <div>
        <div className="flex items-baseline gap-2 bg-gradient-to-br from-[#fff8f3] via-[#fdeee4] to-[#f6e4cf] px-3.5 py-2.5">
          <span className="shrink-0 text-[10px] font-semibold tracking-[0.16em] text-[#a67c52] uppercase">Couple</span>
          <Link href={ROUTES.dashboardPhotoSelectionView(album.id)} prefetch={false} className="min-w-0 truncate font-sans text-lg leading-tight font-bold text-[#3c2922] hover:text-[#8f6834]">
            {album.folderName}
          </Link>
        </div>
        <div className="px-3.5 pt-2">
          <ul className="mb-2 space-y-0.5">
            {rows.map((row) => {
              const Icon = row.icon;
              return (
                <li key={row.label} className="flex items-center gap-2">
                  <span className={`grid size-5 shrink-0 place-items-center rounded-md ${row.accent ? "bg-amber-100 text-amber-700" : "bg-[#f8efe6] text-[#9a7040]"}`}>
                    {row.label === "Status" ? <span className={`size-1.5 rounded-full ${statusDot}`} /> : <Icon className="size-3" />}
                  </span>
                  <span className="w-14 shrink-0 text-[10px] font-semibold tracking-[0.12em] text-[#b08968] uppercase">{row.label}</span>
                  <span className={`truncate text-xs font-medium ${row.accent ? "text-amber-800" : "text-stone-800"}`}>{row.value}</span>
                </li>
              );
            })}
            <li className="flex items-center gap-2">
              <span className="grid size-5 shrink-0 place-items-center rounded-md bg-[#f8efe6] text-[#9a7040]"><KeyRound className="size-3" /></span>
              <span className="w-14 shrink-0 text-[10px] font-semibold tracking-[0.12em] text-[#b08968] uppercase">Code</span>
              <span className="flex min-w-0 items-center gap-1">
                <span className={`truncate font-mono text-xs font-medium text-stone-800 ${album.accessCode && !showCode ? "tracking-[0.22em]" : "tracking-[0.14em]"}`}>{album.accessCode ? (showCode ? album.accessCode : "••••••") : "Not set"}</span>
                {album.accessCode ? <button type="button" onClick={() => setShowCode((current) => !current)} aria-label={showCode ? "Hide access code" : "Show access code"} className="grid size-5 shrink-0 place-items-center rounded text-stone-400 hover:bg-stone-100 hover:text-stone-700">{showCode ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}</button> : null}
              </span>
            </li>
          </ul>
          <div className="mb-2 rounded-lg bg-[#fbf6f1] px-2.5 py-1.5">
            <div className="mb-1.5 flex items-baseline justify-between gap-3 text-xs">
              <span className="text-[#a67c52]">Selected <span className="font-semibold text-stone-800">{album.selectedCount || 0}</span>{rulesConfigured && mode === "FIXED" ? <span> of {album.rules.requiredPhotos}</span> : rulesConfigured && mode === "MIN_EXTRA" ? <span> of {album.rules.includedPhotos}</span> : totalPhotos > 0 ? <span> of {totalPhotos}</span> : null}</span>
              <span className="font-semibold text-[#8f6834]">{targetCount > 0 ? `${percentage}%` : "—"}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[#eadccf]"><div className={`h-full rounded-full ${stage === "Locked" ? "bg-emerald-500" : "bg-gradient-to-r from-[#8f6834] to-[#c5a059]"}`} style={{ width: `${Math.min(100, percentage)}%` }} /></div>
          </div>

        {canShare ? (
          <div className="mb-2 grid grid-cols-[1fr_1fr_auto] gap-1.5">
            <button type="button" onClick={openWhatsApp} className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-2 text-[11px] font-bold text-white shadow-sm hover:bg-emerald-500"><Send className="size-3.5" />WhatsApp</button>
            <a href={`mailto:${album.clientEmail || ""}?subject=${encodeURIComponent(`Photo selection gallery - ${album.folderName}`)}&body=${encodeURIComponent(`${galleryUrl}\nCode: ${album.accessCode}`)}`} className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-sky-600 px-2 text-[11px] font-bold text-white shadow-sm hover:bg-sky-500"><Mail className="size-3.5" />Email</a>
            <button type="button" onClick={copyLink} className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-[#ead8c8] bg-white px-2.5 text-[11px] font-semibold text-stone-700 shadow-sm hover:bg-[#fbf6f1]">{copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}{copied ? "Copied" : "Link"}</button>
          </div>
        ) : album.status === "draft" ? (
          <div className="mb-2 flex items-center justify-between rounded-lg border border-stone-200/70 bg-stone-100/90 px-2.5 py-1.5 text-xs">
            {totalPhotos === 0 ? (
              <>
                <span className="flex items-center gap-1 text-[11px] font-medium text-stone-500"><UploadCloud className="size-3.5 text-amber-500" />Photos pending upload</span>
                <Link href={setupHref(album, 2)} className="rounded bg-amber-600 px-2 py-0.5 text-[10px] font-bold text-white">Upload Photos</Link>
              </>
            ) : !rulesConfigured ? (
              <>
                <span className="flex items-center gap-1 text-[11px] font-bold text-amber-800"><Target className="size-3.5 animate-pulse text-amber-600" />Configure Rules (3 Options)</span>
                <Link href={setupHref(album, 3)} className="rounded bg-amber-600 px-2 py-0.5 text-[10px] font-bold text-white">Configure Rules →</Link>
              </>
            ) : (
              <>
                <span className="text-[11px] font-medium text-stone-500">Ready to publish</span>
                <Link href={setupHref(album, 5)} className="rounded bg-amber-600 px-2 py-0.5 text-[10px] font-bold text-white">Review & Publish</Link>
              </>
            )}
          </div>
        ) : null}
        </div>
      </div>

      <div className="mx-3.5 mt-2 mb-3 flex items-center justify-between gap-2 border-t border-[#f0e2d6] pt-2">
        <div className="flex items-center gap-1">
          {album.status === "draft" ? (
            <Link href={setupHref(album)} className="inline-flex items-center gap-1 rounded-lg border border-amber-500/30 bg-amber-500/15 px-2.5 py-1.5 text-xs font-bold text-amber-700"><Sparkles className="size-3.5" />Resume</Link>
          ) : null}
          <button type="button" onClick={() => setConfirmDelete(true)} className="rounded-lg p-1.5 text-stone-500 hover:bg-rose-50 hover:text-rose-600" aria-label="Delete gallery"><Trash2 className="size-4" /></button>
          {confirmDelete && typeof document !== "undefined" ? createPortal(
            <div className="fixed inset-0 z-50 grid place-items-center bg-[#fdf7f4]/70 p-4 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-labelledby={`delete-${album.id}`}>
              <div className="w-full max-w-sm rounded-2xl border border-[#ead8c8] bg-white p-5 text-stone-900 shadow-xl">
                <h2 id={`delete-${album.id}`} className="text-base font-bold">Delete this gallery?</h2>
                <p className="mt-1 text-sm text-stone-600">“{album.folderName}” and its photos will be removed. This cannot be undone.</p>
                <div className="mt-4 flex justify-end gap-2">
                  <button type="button" disabled={deleting} onClick={() => setConfirmDelete(false)} className="rounded-lg border border-stone-200 px-3 py-2 text-xs font-semibold text-stone-700 disabled:opacity-50">Cancel</button>
                  <button type="button" disabled={deleting} onClick={removeGallery} className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-60">{deleting ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}{deleting ? "Deleting…" : "Delete"}</button>
                </div>
              </div>
            </div>,
            document.body,
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          {locked ? <button type="button" disabled={downloading || !(album.selectedCount > 0)} onClick={downloadSelected} className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 disabled:opacity-50"><Download className="size-3.5" />{downloading ? "Downloading…" : "Download"}</button> : null}
          <Link href={ROUTES.dashboardPhotoSelectionView(album.id)} className="inline-flex items-center gap-1 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-amber-500">Open <ChevronRight className="size-3.5" /></Link>
        </div>
      </div>
    </article>
  );
}
