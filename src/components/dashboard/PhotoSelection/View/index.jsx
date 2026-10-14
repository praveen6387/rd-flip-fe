"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import PagePanel from "@/components/dashboard/_builder/PagePanel";
import { Button } from "@/components/ui/button";
import { useDashboardTheme } from "@/lib/dashboard/ThemeProvider";
import { getAlbum, addPhotos, deleteAlbum, removePhoto, publishAlbum } from "@/lib/photo-selection/store";
import { copySelectedOriginals, downloadOriginals } from "@/lib/photo-selection/originals";
import { ROUTES } from "@/lib/routes";
import { selectionPanel } from "../_builder/panel";
import { acceptedSelectionFiles } from "../_builder/panel";
import { prepareSelectionPhotos } from "../_builder/prepare";

export default function PhotoSelectionView({ albumId }) {
  const { isDark } = useDashboardTheme();
  const router = useRouter();
  const [album, setAlbum] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  useEffect(() => { let active = true; getAlbum(albumId).then(a => { if (active) setAlbum(a); }).catch(e => { if (active) setError(e.message); }); return () => { active = false; }; }, [albumId]);
  async function action(fn, message) {
    setBusy(true);
    try { await fn(); setAlbum(await getAlbum(albumId)); if (message) toast.success(message); }
    catch (e) { toast.error(e.message); }
    finally { setBusy(false); }
  }
  if (!album) return <PagePanel title="Photo Selection"><p>{error || "Loading folder…"}</p><Link href={ROUTES.dashboardPhotoSelection}>Back to folders</Link></PagePanel>;
  const selected = album.status === "selected";
  return <PagePanel title={album.folderName} description={`${album.clientName} · ${album.photoCount} photos · ${album.status}`} actions={<Link href={ROUTES.dashboardPhotoSelection}>Back to folders</Link>}>
    <div className={`${selectionPanel(isDark)} mb-4 space-y-3 p-4`}>
      <p>{album.phone || "No phone added"}</p>
      <p>Client code: <strong className="font-mono text-lg tracking-widest">{album.accessCode}</strong></p>
      <p className="break-all text-sm">Original folder: {album.originalFolderPath}</p>
      <div className="flex flex-wrap gap-2">
        {album.status === "pending" && <Button disabled={busy} onClick={() => navigator.clipboard.writeText(`${window.location.origin}/photo-selection/${album.shareToken}`).then(() => toast.success("Client link copied")).catch(() => toast.error("Could not copy the link."))}>Copy client selection link</Button>}
        {album.status === "pending" && <Link className="rounded-full border px-4 py-2 text-sm" href={`/photo-selection/${album.shareToken}`} target="_blank" rel="noopener noreferrer">Open client selection</Link>}
        {!selected && <label className="cursor-pointer rounded-full border px-4 py-2 text-sm">{busy ? "Uploading…" : "Add photos"}<input disabled={busy} type="file" webkitdirectory="" multiple accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={event => { const files = Array.from(event.target.files); event.target.value = ""; action(async () => { if (files.some(file => file.webkitRelativePath.split("/")[0] !== album.originalFolderPath.replace(/[\\/]+$/, "").split(/[\\/]/).pop())) throw new Error("Choose the original photo folder for this selection."); const { accepted, rejected } = acceptedSelectionFiles(files); if (rejected.length) throw new Error("Choose only JPG, PNG, or WebP photos."); if (new Set(accepted.map(f => f.name)).size !== accepted.length) throw new Error("Original filenames must be unique."); await addPhotos(albumId, await prepareSelectionPhotos(accepted)); }, "Photos uploaded"); }} /></label>}
        {album.status === "draft" && <Button disabled={busy || !album.photoCount} onClick={() => action(() => publishAlbum(albumId), "Folder ready for the client")}>Finish upload and enable client link</Button>}
        {selected && <>
          <Button disabled={busy} onClick={() => action(() => copySelectedOriginals(album), "Selected originals extracted into a new folder beside the original")}>Extract selected originals</Button>
          <label className="cursor-pointer rounded-full border px-4 py-2 text-sm">Download originals ZIP<input disabled={busy} type="file" webkitdirectory="" multiple className="sr-only" onChange={event => { const files = Array.from(event.target.files); event.target.value = ""; action(() => downloadOriginals(album, files), "Selected originals downloaded"); }} /></label>
        </>}
        {confirmDelete ? <><Button disabled={busy} variant="destructive" onClick={async () => { setBusy(true); try { await deleteAlbum(albumId); router.push(ROUTES.dashboardPhotoSelection); } catch (e) { toast.error(e.message); setBusy(false); } }}>Confirm delete folder</Button><Button onClick={() => setConfirmDelete(false)}>Cancel</Button></> : <Button disabled={busy} variant="outline" onClick={() => setConfirmDelete(true)}>Delete folder</Button>}
        <Button disabled={busy} variant="outline" onClick={() => action(async () => {})}>Refresh status</Button>
      </div>
      {selected && <p className="text-sm">{album.selectedCount} photos selected. Click Extract and choose the parent folder containing the original folder. A new sibling folder will contain only the selected originals. For ZIP download, choose the original folder itself.</p>}
    </div>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {album.photos.map(photo => <figure key={photo.id} className={`${selectionPanel(isDark)} overflow-hidden ${photo.selected ? "ring-2 ring-sky-500" : ""}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo.imageUrl} alt={photo.name} className="aspect-square w-full object-cover" />
        <figcaption className="truncate p-2 text-xs">{photo.selected ? "✓ Selected · " : ""}{photo.name}</figcaption>
        {!selected && <button disabled={busy} className="px-2 pb-2 text-xs text-rose-500" onClick={() => action(() => removePhoto(albumId, photo.id))}>Remove</button>}
      </figure>)}
    </div>
  </PagePanel>;
}
