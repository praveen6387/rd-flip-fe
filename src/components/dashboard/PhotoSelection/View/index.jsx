"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ArrowLeft, Copy, Download, ExternalLink, FileText, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import PagePanel from "@/components/dashboard/_builder/PagePanel";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useDashboardTheme } from "@/lib/dashboard/ThemeProvider";
import { getAlbum, deleteAlbum, removePhoto, reopenAlbum } from "@/lib/photo-selection/store";
import { downloadLocalOriginals } from "@/lib/photo-selection/originals";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/cn";
import { selectionStatus } from "../_builder/panel";
import { rotationClass } from "../Gallery/rotation";
import { selectionRuleText } from "@/lib/photo-selection/rules";
import SelectionProgress from "../_builder/SelectionProgress";
import NexpicCanvas from "../_builder/NexpicCanvas";

const viewGold = "inline-flex h-9 items-center gap-1.5 rounded-lg bg-amber-700 px-3.5 text-xs font-bold text-white shadow-sm shadow-amber-700/30 hover:bg-amber-600 disabled:opacity-50";
const viewQuiet = "inline-flex h-9 items-center gap-1.5 rounded-lg border border-stone-300 bg-stone-50 px-3.5 text-xs font-semibold text-stone-800 shadow-sm hover:bg-white disabled:opacity-50";
const viewDanger = "inline-flex h-9 items-center gap-1.5 rounded-lg border border-rose-300 bg-rose-50 px-3.5 text-xs font-semibold text-rose-700 shadow-sm hover:bg-rose-100 disabled:opacity-50";

function folderChip(active, small) {
  return `rounded-full px-3 whitespace-nowrap font-semibold ${small ? "py-1 text-[11px]" : "py-1.5 text-xs"} ${active ? "bg-amber-700 text-white" : "border border-[#ead8c8] bg-white text-[#6b5344]"}`;
}

function viewPhone(value) {
  const digits = String(value || "").replace(/\D/g, "");
  const local = digits.length > 10 ? digits.slice(-10) : digits;
  if (local.length !== 10) return value || "Not set";
  return `+91 ${local.slice(0, 5)} ${local.slice(5)}`;
}

function csvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function downloadSelectedNames(album) {
  const rows = (album.photos || []).filter((photo) => photo.selected);
  const lines = [
    ["filename", "folder", "rating", "cover", "notes"].join(","),
    ...rows.map((photo) => [photo.name, photo.originalRelativePath || "", photo.rating || "", photo.coverType || "", photo.notes || ""].map(csvCell).join(",")),
  ];
  const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `${(album.folderName || "selection").replace(/[^a-zA-Z0-9_-]/g, "_")}_Selected_Filenames.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function PhotoSelectionView({ albumId, initialAlbum = null, initialError = "" }) {
  const { isDark } = useDashboardTheme();
  const router = useRouter();
  const [album, setAlbum] = useState(initialAlbum);
  const [error, setError] = useState(initialError);
  const [busy, setBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [work, setWork] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [exportJob, setExportJob] = useState(null);
  const [folder, setFolder] = useState("All");
  const [nested, setNested] = useState("All");
  const [picked, setPicked] = useState(initialAlbum?.status === "selected" ? "selected" : "all");
  const filterTouched = useRef(false);
  const categories = useMemo(() => [...new Set((album?.photos || []).map((photo) => photo.category).filter(Boolean))], [album]);
  const subfolders = useMemo(() => [...new Set((album?.photos || []).filter((photo) => folder === "All" || photo.category === folder).map((photo) => photo.subfolder).filter(Boolean))], [album, folder]);
  useEffect(() => {
    setAlbum(initialAlbum);
    setError(initialError || "");
    if (!filterTouched.current && initialAlbum?.status === "selected") setPicked("selected");
  }, [albumId, initialAlbum, initialError]);
  async function removeFolder() {
    setBusy(true);
    try {
      await deleteAlbum(albumId);
      router.push(ROUTES.dashboardPhotoSelection);
    } catch (error) {
      toast.error(error.message || "Could not delete the gallery.");
      setBusy(false);
    }
  }

  async function action(fn, message) {
    setBusy(true);
    try { await fn(); setAlbum(await getAlbum(albumId)); if (message) toast.success(message); }
    catch (e) { toast.error(e.message); }
    finally { setBusy(false); setWork(null); }
  }
  async function allowZip() {
    setExportJob({ kind: "zip", step: "working", message: "", current: 0, total: album.selectedCount });
    try {
      await downloadLocalOriginals(album, (progress) => {
        setExportJob((job) => (job ? { ...job, step: "working", current: progress.current, total: progress.total } : job));
      });
      setExportJob((job) => ({
        ...job,
        step: "done",
        message: "The ZIP contains the original photos from the parent folder you chose.",
      }));
    } catch (error) {
      setExportJob((job) => ({ ...job, step: "error", message: error.message || "Could not download the selected photos." }));
    }
  }
  const backToFolders = (
    <Link
      href={ROUTES.dashboardPhotoSelection}
      prefetch={false}
      className={cn(
        "inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-sm font-semibold",
        isDark ? "bg-white/10 text-white" : "bg-white/70 text-slate-700 shadow-sm"
      )}
    >
      <ArrowLeft className="size-4" />
      Back to folders
    </Link>
  );
  if (!album) return <NexpicCanvas bleed><PagePanel title="Photo Selection" actions={backToFolders}>{error ? <p>{error}</p> : null}</PagePanel></NexpicCanvas>;
  const selected = album.status === "selected";
  const canEditPhotos = album.status === "draft";
  const folderStatus = selectionStatus(album);
  const inView = album.photos.filter((photo) => (folder === "All" || photo.category === folder) && (nested === "All" || photo.subfolder === nested));
  const showCounts = { all: inView.length, selected: inView.filter((photo) => photo.selected).length, unselected: inView.filter((photo) => !photo.selected).length };
  const folderCounts = album.photos.reduce((counts, photo) => { if (photo.category) counts[photo.category] = (counts[photo.category] || 0) + 1; return counts; }, {});
  const subCounts = album.photos.reduce((counts, photo) => { if ((folder === "All" || photo.category === folder) && photo.subfolder) counts[photo.subfolder] = (counts[photo.subfolder] || 0) + 1; return counts; }, {});
  const folderTotal = album.photos.length;
  return <NexpicCanvas bleed><PagePanel>
    <SelectionProgress state={work} isDark={isDark} />
    <div className="mb-3 overflow-hidden rounded-2xl border border-[#ead8c8] bg-white text-stone-900">
      <div className="flex items-center justify-between gap-3 border-b border-[#f0e2d6] px-3 py-2.5">
        <div className="min-w-0">
          <h2 className="truncate text-base font-bold text-stone-900">{album.folderName}</h2>
          <p className="truncate text-xs text-[#8a6a52]">{album.clientName || "Client"} · {album.photoCount} photos · {folderStatus.label}</p>
        </div>
        {backToFolders}
      </div>
      <div className="grid grid-cols-2 gap-2 p-3">
        {[
          ["Mobile", viewPhone(album.phone)],
          ["Access code", album.accessCode || "Not set"],
        ].map(([label, value]) => (
          <div key={label} className="min-w-0 rounded-xl bg-[#fbf6f1] px-3 py-2">
            <p className="text-[10px] font-semibold tracking-[0.12em] text-[#b08968] uppercase">{label}</p>
            <p className="truncate text-sm font-semibold text-stone-800" title={value}>{value}</p>
          </div>
        ))}
        <div className="col-span-2 rounded-xl bg-[#fbf6f1] px-3 py-2">
          <p className="text-[10px] font-semibold tracking-[0.12em] text-[#b08968] uppercase">Selection</p>
          <p className="text-sm font-semibold text-stone-800">{`${selectionRuleText(album.rules)}${album.rules?.confirmedByName ? ` Confirmed by ${album.rules.confirmedByName}.` : ""}${album.status === "selected" && album.rules?.totalExtraCharge > 0 ? ` Extra quote ₹${album.rules.totalExtraCharge}.` : ""}`}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 px-3 pb-3">
        {album.status !== "draft" && <button type="button" disabled={busy} onClick={() => navigator.clipboard.writeText(`${window.location.origin}/photo-selection/${album.shareToken}`).then(() => toast.success("Client link copied")).catch(() => toast.error("Could not copy the link."))} className={viewGold}><Copy className="size-3.5" />Copy gallery link</button>}
        {album.status !== "draft" && <Link className={viewQuiet} href={`/photo-selection/${album.shareToken}`} target="_blank" rel="noopener noreferrer"><ExternalLink className="size-3.5" />Open client gallery</Link>}
        {album.status === "draft" ? <Link className={viewGold} href={`${ROUTES.dashboardPhotoSelectionNew}?album=${album.id}&step=${album.photoCount ? Math.min(5, Math.max(1, album.wizardStep || 2)) : 2}`}>{album.photoCount ? "Resume setup" : "Upload photos"}</Link> : null}
        {selected && <>
          <button type="button" disabled={busy} onClick={() => action(() => reopenAlbum(albumId), "Selection reopened for the client")} className={viewQuiet}>Reopen selection</button>
          <button type="button" disabled={Boolean(exportJob)} onClick={allowZip} className={viewQuiet}><Download className="size-3.5" />Download selected ZIP</button>
        </>}
        <button type="button" disabled={busy} onClick={() => setConfirmDelete(true)} className={viewDanger}><Trash2 className="size-3.5" />Delete folder</button>
        <button type="button" disabled={busy} onClick={async () => { setRefreshing(true); try { await action(async () => {}); } finally { setRefreshing(false); } }} className={viewQuiet}><RefreshCw className={`size-3.5 ${refreshing ? "animate-spin" : ""}`} />{refreshing ? "Refreshing…" : "Refresh status"}</button>
      </div>
    </div>
    <div className="mb-3 space-y-2 rounded-2xl border border-[#ead8c8] bg-white px-3 py-2.5">
      <div className="flex items-center gap-3">
        <span className="w-20 shrink-0 text-[10px] font-semibold tracking-[0.12em] text-[#b08968] uppercase">Folder</span>
        <div className="flex min-w-0 gap-1.5 overflow-x-auto">
          <button type="button" onClick={() => { setFolder("All"); setNested("All"); }} className={folderChip(folder === "All")}>All ({folderTotal})</button>
          {categories.map((name) => <button key={name} type="button" onClick={() => { setFolder(name); setNested("All"); }} className={folderChip(folder === name)}>{name} ({folderCounts[name] || 0})</button>)}
        </div>
      </div>
      {subfolders.length ? <div className="flex items-center gap-3">
        <span className="w-20 shrink-0 text-[10px] font-semibold tracking-[0.12em] text-[#b08968] uppercase">Uploaded</span>
        <div className="flex min-w-0 gap-1.5 overflow-x-auto">{["All", ...subfolders].map((name) => <button key={name} type="button" onClick={() => setNested(name)} className={folderChip(nested === name, true)}>{name === "All" ? `All (${folder === "All" ? folderTotal : folderCounts[folder] || 0})` : `${name} (${subCounts[name] || 0})`}</button>)}</div>
      </div> : null}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="w-20 shrink-0 text-[10px] font-semibold tracking-[0.12em] text-[#b08968] uppercase">Photos</span>
          <div className="flex gap-1.5">{[["all", "All"], ["selected", "Selected"], ["unselected", "Not selected"]].map(([value, label]) => <button key={value} type="button" onClick={() => { filterTouched.current = true; setPicked(value); }} className={folderChip(picked === value)}>{label} ({showCounts[value]})</button>)}</div>
        </div>
        {selected && picked === "selected" ? (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" disabled={!album.selectedCount} onClick={() => downloadSelectedNames(album)}><FileText />Download filenames</Button>
          </div>
        ) : null}
      </div>
    </div>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {album.photos.filter((photo) => (folder === "All" || photo.category === folder) && (nested === "All" || photo.subfolder === nested) && (picked === "selected" ? photo.selected : picked === "unselected" ? !photo.selected : true)).map(photo => <figure key={photo.id} className={`overflow-hidden rounded-2xl bg-stone-100 ${photo.selected ? "ring-4 ring-rose-500" : ""}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo.imageUrl} alt={photo.name} className={`aspect-square w-full object-cover ${rotationClass(photo.rotation)}`} />
        <figcaption className="truncate p-2 text-xs">{photo.selected ? "✓ Selected · " : ""}{photo.rating ? `${photo.rating}★ · ` : ""}{photo.coverType ? `${photo.coverType} cover · ` : ""}{photo.notes ? `${photo.notes} · ` : ""}{photo.name}</figcaption>
        {canEditPhotos && <button disabled={busy} className="px-2 pb-2 text-xs text-rose-500" onClick={() => action(() => removePhoto(albumId, photo.id))}>Remove</button>}
      </figure>)}
    </div>
    {confirmDelete && typeof document !== "undefined" ? createPortal(
      <div className="fixed inset-0 z-50 grid place-items-center bg-[#fdf7f4]/70 p-4 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-labelledby="delete-folder-title">
        <div className="w-full max-w-sm rounded-2xl border border-[#ead8c8] bg-white p-5 text-stone-900 shadow-xl">
          <h2 id="delete-folder-title" className="text-base font-bold">Delete this gallery?</h2>
          <p className="mt-1 text-sm text-stone-600">“{album.folderName}” and its photos will be removed. This cannot be undone.</p>
          <div className="mt-4 flex justify-end gap-2">
            <button type="button" disabled={busy} onClick={() => setConfirmDelete(false)} className="rounded-lg border border-stone-200 px-3 py-2 text-xs font-semibold text-stone-700 disabled:opacity-50">Cancel</button>
            <button type="button" disabled={busy} onClick={removeFolder} className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-60">{busy ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}{busy ? "Deleting…" : "Delete"}</button>
          </div>
        </div>
      </div>,
      document.body,
    ) : null}
    <Dialog open={Boolean(exportJob)} onOpenChange={(open) => { if (!open && exportJob?.step !== "working") setExportJob(null); }}>
      <DialogContent
        showCloseButton={exportJob?.step !== "working"}
        className={cn("sm:max-w-md", isDark ? "border-white/15 bg-slate-900 text-white" : "bg-white text-slate-900")}
        onInteractOutside={(event) => { if (exportJob?.step === "working") event.preventDefault(); }}
        onEscapeKeyDown={(event) => { if (exportJob?.step === "working") event.preventDefault(); }}
      >
        <DialogTitle>
          {exportJob?.step === "working"
            ? "Preparing ZIP"
            : exportJob?.step === "done"
              ? "ZIP ready"
              : "Could not finish"}
        </DialogTitle>
        <DialogDescription className={cn("text-sm", isDark ? "text-slate-300" : "text-slate-600")}>
          {exportJob?.step === "working"
            ? "Choose the parent folder. The ZIP is built from the original photos inside it."
            : exportJob?.message}
        </DialogDescription>
        {exportJob?.step === "working" ? (
          <div className="flex items-center gap-3 py-2">
            <Loader2 className="size-5 animate-spin text-sky-600" />
            <p className="text-sm font-medium">{exportJob.total ? `Adding ${exportJob.current} of ${exportJob.total} original photos` : "Finding the original photos on this computer."}</p>
          </div>
        ) : null}
        {exportJob?.step === "done" || exportJob?.step === "error" ? (
          <div className="flex justify-end">
            <Button onClick={() => setExportJob(null)}>Close</Button>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  </PagePanel></NexpicCanvas>;
}
