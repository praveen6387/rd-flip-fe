"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import PagePanel from "@/components/dashboard/_builder/PagePanel";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useDashboardTheme } from "@/lib/dashboard/ThemeProvider";
import { getAlbum, deleteAlbum, removePhoto, reopenAlbum } from "@/lib/photo-selection/store";
import { copySelectedOriginals, downloadOriginals, folderBasename } from "@/lib/photo-selection/originals";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/cn";
import { selectionStatus, selectionStatusClass } from "../_builder/panel";
import { selectionRuleText } from "@/lib/photo-selection/rules";
import SelectionProgress from "../_builder/SelectionProgress";

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
  async function action(fn, message) {
    setBusy(true);
    try { await fn(); setAlbum(await getAlbum(albumId)); if (message) toast.success(message); }
    catch (e) { toast.error(e.message); }
    finally { setBusy(false); setWork(null); }
  }
  async function allowExtract() {
    if (!window.showDirectoryPicker) {
      setExportJob({ kind: "extract", step: "error", message: "This browser cannot copy into a folder. Use Download originals ZIP instead.", current: 0, total: album.selectedCount });
      return;
    }
    const picked = window.showDirectoryPicker({ mode: "readwrite", id: "rd-flip-selection-originals" });
    let directory;
    try {
      directory = await picked;
    } catch (error) {
      if (error?.name !== "AbortError") {
        setExportJob({ kind: "extract", step: "error", message: error?.message || "Could not open the original folder.", current: 0, total: album.selectedCount });
      }
      return;
    }
    setExportJob({ kind: "extract", step: "working", message: "", current: 0, total: album.selectedCount });
    try {
      const count = await copySelectedOriginals(album, Promise.resolve(directory), (progress) => {
        setExportJob((job) => (job ? { ...job, step: "working", current: progress.current, total: progress.total } : job));
      });
      const folder = folderBasename(album.originalFolderPath);
      setExportJob((job) => ({
        ...job,
        step: "done",
        message: `Copied ${count} original photo${count === 1 ? "" : "s"} into the Selected folder inside “${folder}”.`,
      }));
    } catch (error) {
      setExportJob((job) => ({ ...job, step: "error", message: error.message || "Could not copy the selected originals." }));
    }
  }
  async function allowZip() {
    if (!window.showDirectoryPicker) {
      setExportJob({ kind: "zip", step: "error", message: "This browser cannot choose a folder for the ZIP.", current: 0, total: album.selectedCount });
      return;
    }
    const picked = window.showDirectoryPicker({ mode: "read", id: "rd-flip-selection-originals" });
    let directory;
    try {
      directory = await picked;
    } catch (error) {
      if (error?.name !== "AbortError") {
        setExportJob({ kind: "zip", step: "error", message: error?.message || "Could not open the original folder.", current: 0, total: album.selectedCount });
      }
      return;
    }
    setExportJob({ kind: "zip", step: "working", message: "", current: 0, total: album.selectedCount });
    try {
      await downloadOriginals(album, Promise.resolve(directory), (progress) => {
        setExportJob((job) => (job ? { ...job, step: "working", current: progress.current, total: progress.total } : job));
      });
      const folder = folderBasename(album.originalFolderPath);
      setExportJob((job) => ({
        ...job,
        step: "done",
        message: `Downloaded the selected original photos from “${folder}” as a ZIP.`,
      }));
    } catch (error) {
      setExportJob((job) => ({ ...job, step: "error", message: error.message || "Could not download the originals." }));
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
  if (!album) return <PagePanel title="Photo Selection" actions={backToFolders}>{error ? <p>{error}</p> : null}</PagePanel>;
  const selected = album.status === "selected";
  const canEditPhotos = album.status === "draft";
  const folderStatus = selectionStatus(album);
  return <PagePanel title={album.folderName} description={`${album.clientName} · ${album.photoCount} photos`} actions={backToFolders}>
    <div className="mb-4 space-y-3 rounded-xl border border-stone-200 bg-white p-4 text-stone-900">
      <div className="flex flex-wrap items-center gap-2">
        <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", selectionStatusClass(album.status, isDark))}>{folderStatus.label}</span>
        <span className={cn("text-sm", isDark ? "text-slate-300" : "text-slate-600")}>{folderStatus.hint}</span>
      </div>
      <p>{album.phone || "No phone added"}</p>
      <p>Client code: <strong className="font-mono text-lg tracking-widest">{album.accessCode}</strong></p>
      <p className="break-all text-sm">Original folder: {album.originalFolderPath}</p>
      <p className="text-sm">{selectionRuleText(album.rules)}{album.rules?.confirmedByName ? ` Confirmed by ${album.rules.confirmedByName}.` : ""}{album.status === "selected" && album.rules?.totalExtraCharge > 0 ? ` Extra quote ₹${album.rules.totalExtraCharge}.` : ""}</p>
      <div className="flex flex-wrap gap-2">
        {album.status !== "draft" && <Button disabled={busy} onClick={() => navigator.clipboard.writeText(`${window.location.origin}/photo-selection/${album.shareToken}`).then(() => toast.success("Client link copied")).catch(() => toast.error("Could not copy the link."))}>Copy gallery link</Button>}
        {album.status !== "draft" && <Link className="rounded-full border px-4 py-2 text-sm" href={`/photo-selection/${album.shareToken}`} target="_blank" rel="noopener noreferrer">Open client gallery</Link>}
        {album.status === "draft" ? <Link className="rounded-full bg-stone-900 px-4 py-2 text-sm font-semibold text-white" href={`${ROUTES.dashboardPhotoSelectionNew}?album=${album.id}&step=${album.photoCount ? Math.min(5, Math.max(1, album.wizardStep || 2)) : 2}`}>{album.photoCount ? "Resume setup" : "Upload photos"}</Link> : null}
        {selected && <>
          <Button disabled={busy} onClick={() => action(() => reopenAlbum(albumId), "Selection reopened for the client")}>Reopen selection</Button>
          <Button disabled={Boolean(exportJob)} onClick={allowExtract}>Extract selected originals</Button>
          <Button disabled={Boolean(exportJob)} onClick={allowZip}>Download originals ZIP</Button>
        </>}
        {confirmDelete ? <><Button disabled={busy} variant="destructive" onClick={async () => { setBusy(true); try { await deleteAlbum(albumId); router.push(ROUTES.dashboardPhotoSelection); } catch (e) { toast.error(e.message); setBusy(false); } }}>Confirm delete folder</Button><Button onClick={() => setConfirmDelete(false)}>Cancel</Button></> : <Button disabled={busy} variant="outline" onClick={() => setConfirmDelete(true)}>Delete folder</Button>}
        <Button disabled={busy} variant="outline" onClick={() => action(async () => {})}>Refresh status</Button>
      </div>
    </div>
    <div className="mb-4 flex flex-col gap-2">
      <div className="flex gap-1.5 overflow-x-auto">
        <button type="button" onClick={() => { setFolder("All"); setNested("All"); }} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${folder === "All" ? "bg-stone-900 text-white" : "border bg-white"}`}>All folders</button>
        {categories.map((name) => <button key={name} type="button" onClick={() => { setFolder(name); setNested("All"); }} className={`rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap ${folder === name ? "bg-stone-900 text-white" : "border bg-white"}`}>{name}</button>)}
      </div>
      {subfolders.length ? <div className="flex gap-1.5 overflow-x-auto">{["All", ...subfolders].map((name) => <button key={name} type="button" onClick={() => setNested(name)} className={`rounded-full px-3 py-1 text-[11px] font-medium ${nested === name ? "bg-amber-700 text-white" : "bg-white"}`}>{name === "All" ? "All subfolders" : name}</button>)}</div> : null}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1">{[["all", "All"], ["selected", "Selected"], ["unselected", "Not selected"]].map(([value, label]) => <button key={value} type="button" onClick={() => { filterTouched.current = true; setPicked(value); }} className={`rounded-full px-3 py-1 text-xs font-semibold ${picked === value ? "bg-rose-600 text-white" : "bg-white"}`}>{label}{value === "selected" ? ` (${album.selectedCount})` : ""}</button>)}</div>
        {selected && picked === "selected" ? (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" disabled={!album.selectedCount} onClick={() => downloadSelectedNames(album)}><FileText />Download filenames</Button>
            <Button disabled={!album.selectedCount || Boolean(exportJob)} onClick={allowZip}><Download />Download photos</Button>
          </div>
        ) : null}
      </div>
    </div>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {album.photos.filter((photo) => (folder === "All" || photo.category === folder) && (nested === "All" || photo.subfolder === nested) && (picked === "selected" ? photo.selected : picked === "unselected" ? !photo.selected : true)).map(photo => <figure key={photo.id} className={`overflow-hidden rounded-2xl bg-stone-100 ${photo.selected ? "ring-4 ring-rose-500" : ""}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo.imageUrl} alt={photo.name} className="aspect-square w-full object-cover" />
        <figcaption className="truncate p-2 text-xs">{photo.selected ? "✓ Selected · " : ""}{photo.rating ? `${photo.rating}★ · ` : ""}{photo.coverType ? `${photo.coverType} cover · ` : ""}{photo.notes ? `${photo.notes} · ` : ""}{photo.name}</figcaption>
        {canEditPhotos && <button disabled={busy} className="px-2 pb-2 text-xs text-rose-500" onClick={() => action(() => removePhoto(albumId, photo.id))}>Remove</button>}
      </figure>)}
    </div>
    <SelectionProgress state={work} isDark={isDark} />
    <Dialog open={Boolean(exportJob)} onOpenChange={(open) => { if (!open && exportJob?.step !== "working") setExportJob(null); }}>
      <DialogContent
        showCloseButton={exportJob?.step !== "working"}
        className={cn("sm:max-w-md", isDark ? "border-white/15 bg-slate-900 text-white" : "bg-white text-slate-900")}
        onInteractOutside={(event) => { if (exportJob?.step === "working") event.preventDefault(); }}
        onEscapeKeyDown={(event) => { if (exportJob?.step === "working") event.preventDefault(); }}
      >
        <DialogTitle>
          {exportJob?.step === "working"
            ? exportJob.kind === "zip" ? "Preparing ZIP" : "Copying originals"
            : exportJob?.step === "done"
              ? "Originals ready"
              : "Could not finish"}
        </DialogTitle>
        <DialogDescription className={cn("text-sm", isDark ? "text-slate-300" : "text-slate-600")}>
          {exportJob?.step === "working"
            ? exportJob.kind === "zip"
              ? "Packing the original files into a ZIP."
              : "Copying the original files into a Selected folder."
            : exportJob?.message}
        </DialogDescription>
        {exportJob?.step === "working" ? (
          <div className="flex items-center gap-3 py-2">
            <Loader2 className="size-5 animate-spin text-sky-600" />
            <p className="text-sm font-medium">{exportJob.kind === "zip" ? `Adding ${exportJob.current} of ${exportJob.total} to the ZIP` : `Copying ${exportJob.current} of ${exportJob.total}`}</p>
          </div>
        ) : null}
        {exportJob?.step === "done" || exportJob?.step === "error" ? (
          <div className="flex justify-end">
            <Button onClick={() => setExportJob(null)}>Close</Button>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  </PagePanel>;
}
