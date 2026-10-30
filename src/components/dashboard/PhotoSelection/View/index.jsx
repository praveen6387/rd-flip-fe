"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import PagePanel from "@/components/dashboard/_builder/PagePanel";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useDashboardTheme } from "@/lib/dashboard/ThemeProvider";
import { getAlbum, addPhotos, deleteAlbum, removePhoto, publishAlbum } from "@/lib/photo-selection/store";
import { copySelectedOriginals, downloadOriginals, folderBasename } from "@/lib/photo-selection/originals";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/cn";
import { selectionPanel, selectionStatus, selectionStatusClass } from "../_builder/panel";
import { acceptedSelectionFiles } from "../_builder/panel";
import { prepareSelectionPhotos } from "../_builder/prepare";
import SelectionProgress from "../_builder/SelectionProgress";

export default function PhotoSelectionView({ albumId, initialAlbum = null, initialError = "" }) {
  const { isDark } = useDashboardTheme();
  const router = useRouter();
  const [album, setAlbum] = useState(initialAlbum);
  const [error, setError] = useState(initialError);
  const [busy, setBusy] = useState(false);
  const [work, setWork] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [exportJob, setExportJob] = useState(null);
  useEffect(() => {
    setAlbum(initialAlbum);
    setError(initialError || "");
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
    <div className={`${selectionPanel(isDark)} mb-4 space-y-3 p-4`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", selectionStatusClass(album.status, isDark))}>{folderStatus.label}</span>
        <span className={cn("text-sm", isDark ? "text-slate-300" : "text-slate-600")}>{folderStatus.hint}</span>
      </div>
      <p>{album.phone || "No phone added"}</p>
      <p>Client code: <strong className="font-mono text-lg tracking-widest">{album.accessCode}</strong></p>
      <p className="break-all text-sm">Original folder: {album.originalFolderPath}</p>
      <div className="flex flex-wrap gap-2">
        {album.status === "pending" && <Button disabled={busy} onClick={() => navigator.clipboard.writeText(`${window.location.origin}/photo-selection/${album.shareToken}`).then(() => toast.success("Client link copied")).catch(() => toast.error("Could not copy the link."))}>Copy client selection link</Button>}
        {album.status === "pending" && <Link className="rounded-full border px-4 py-2 text-sm" href={`/photo-selection/${album.shareToken}`} target="_blank" rel="noopener noreferrer">Open client selection</Link>}
        {canEditPhotos && album.photoCount > 0 && <label className="cursor-pointer rounded-full border px-4 py-2 text-sm">Add photos<input disabled={busy} type="file" webkitdirectory="" multiple accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={event => { const files = Array.from(event.target.files); event.target.value = ""; action(async () => { if (files.some(file => file.webkitRelativePath.split("/")[0] !== album.originalFolderPath.replace(/[\\/]+$/, "").split(/[\\/]/).pop())) throw new Error("Choose the original photo folder for this selection."); const { accepted, rejected } = acceptedSelectionFiles(files); if (rejected.length) throw new Error("Choose only JPG, PNG, or WebP photos."); if (new Set(accepted.map(f => f.name)).size !== accepted.length) throw new Error("Original filenames must be unique."); if (!accepted.length) return; const prepared = await prepareSelectionPhotos(accepted, (progress) => setWork({ phase: "optimize", ...progress })); await addPhotos(albumId, prepared, setWork); }, "Photos uploaded"); }} /></label>}
        {album.status === "draft" && album.photoCount > 0 && <Button disabled={busy} onClick={() => action(() => publishAlbum(albumId), "Folder ready for the client")}>Finish upload and enable client link</Button>}
        {selected && <>
          <Button disabled={Boolean(exportJob)} onClick={allowExtract}>Extract selected originals</Button>
          <Button disabled={Boolean(exportJob)} onClick={allowZip}>Download originals ZIP</Button>
        </>}
        {confirmDelete ? <><Button disabled={busy} variant="destructive" onClick={async () => { setBusy(true); try { await deleteAlbum(albumId); router.push(ROUTES.dashboardPhotoSelection); } catch (e) { toast.error(e.message); setBusy(false); } }}>Confirm delete folder</Button><Button onClick={() => setConfirmDelete(false)}>Cancel</Button></> : <Button disabled={busy} variant="outline" onClick={() => setConfirmDelete(true)}>Delete folder</Button>}
        <Button disabled={busy} variant="outline" onClick={() => action(async () => {})}>Refresh status</Button>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {album.photos.map(photo => <figure key={photo.id} className={`${selectionPanel(isDark)} overflow-hidden ${photo.selected ? "ring-2 ring-sky-500" : ""}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo.imageUrl} alt={photo.name} className="aspect-square w-full object-cover" />
        <figcaption className="truncate p-2 text-xs">{photo.selected ? "✓ Selected · " : ""}{photo.name}</figcaption>
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
