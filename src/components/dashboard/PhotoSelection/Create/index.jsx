"use client";

import { useAuth } from "@/components/auth";
import { hasPhotoSelectionCredit } from "@/lib/credits";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import PagePanel from "@/components/dashboard/_builder/PagePanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDashboardTheme } from "@/lib/dashboard/ThemeProvider";
import { uploadedFolder } from "@/lib/photo-selection/folder";
import { createAlbum } from "@/lib/photo-selection/store";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/cn";
import { acceptedSelectionFiles, selectionPanel } from "../_builder/panel";
import { prepareSelectionPhotos } from "../_builder/prepare";

export default function PhotoSelectionCreate() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [originalFolderPath, setOriginalFolderPath] = useState("");
  const { isDark } = useDashboardTheme();
  const [clientName, setClientName] = useState("");
  const [phone, setPhone] = useState("");
  const [folderName, setFolderName] = useState("");
  const [files, setFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [preparing, setPreparing] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const dragDepth = useRef(0);
  const fieldClass = cn(
    "h-10 rounded-xl border px-3 text-sm shadow-none",
    isDark
      ? "border-white/12 bg-[#1a222d] text-white placeholder:text-slate-500 focus-visible:border-sky-400/50 focus-visible:ring-sky-400/20"
      : "border-[#e0d5c4]/90 bg-[#fffcf8]/95 text-slate-900 placeholder:text-slate-400 focus-visible:border-sky-400/60 focus-visible:bg-white focus-visible:ring-sky-300/30"
  );
  const labelClass = cn(
    "text-sm font-medium",
    isDark ? "text-slate-200" : "text-slate-700"
  );
  const filesRef = useRef(files);
  useEffect(() => { filesRef.current = files; }, [files]);

  useEffect(() => {
    return () => {
      filesRef.current.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, []);

  async function addFiles(fileList) {
    let upload;
    try { upload = uploadedFolder(fileList); } catch (error) { toast.error(error.message); return; }
    if (originalFolderPath && originalFolderPath !== upload.folder) { toast.error("Upload photos from the same folder, or remove the current photos first."); return; }
    const { accepted, rejected } = acceptedSelectionFiles(fileList);
    rejected.forEach((file) => {
      toast.error(`${file.name} isn’t a JPG, PNG, or WebP.`);
    });
    if (!accepted.length) return;

    setPreparing((count) => count + 1);
    try {
      const prepared = await prepareSelectionPhotos(accepted);
      prepared.forEach((file, index) => { file.selectionRelativePath = accepted[index].webkitRelativePath.split("/").slice(1).join("/"); });
      setOriginalFolderPath(upload.folder);
      setFolderName(current => current || upload.folder);
      setFiles((current) => [
        ...current,
        ...prepared.map((file) => ({
          id: crypto.randomUUID(),
          file,
          previewUrl: URL.createObjectURL(file),
        })),
      ]);
    } catch (error) {
      toast.error(error.message || "Could not prepare those photos.");
    } finally {
      setPreparing((count) => count - 1);
    }
  }

  function removeFile(id) {
    if (files.length === 1) setOriginalFolderPath("");
    setFiles((current) => {
      const target = current.find((item) => item.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return current.filter((item) => item.id !== id);
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!hasPhotoSelectionCredit(user)) { router.push(ROUTES.dashboardPlans); return; }
    if (!originalFolderPath.trim()) { toast.error("Choose the photo folder to upload."); return; }
    if (new Set(files.map(item => item.file.name)).size !== files.length) { toast.error("Each photo must have a unique original filename."); return; }
    if (!clientName.trim() || !folderName.trim()) {
      toast.error("Add the client name and folder name.");
      return;
    }
    if (!files.length) {
      toast.error("Upload at least one photo.");
      return;
    }

    setSaving(true);
    try {
      const album = await createAlbum({
        clientName,
        phone,
        folderName,
        originalFolderPath,
        files: files.map((item) => item.file),
      });
      await refreshUser();
      toast.success("Selection folder uploaded");
      router.push(ROUTES.dashboardPhotoSelectionView(album.id));
    } catch (error) {
      await refreshUser().catch(() => {});
      toast.error(error.message || "Could not save this folder.");
      setSaving(false);
    }
  }

  if (user && !hasPhotoSelectionCredit(user)) return <PagePanel title="Photo Selection" description="Buy a Photo Selection or All plan to create a folder. Each folder uses one credit."><Link href={ROUTES.dashboardPlans} className="inline-flex rounded-full bg-sky-600 px-5 py-3 text-white">Buy a plan</Link></PagePanel>;

  return (
    <PagePanel
      title="Upload photos"
      description="Add the client and folder, then upload the photos for this selection."
      actions={
        <Link
          href={ROUTES.dashboardPhotoSelection}
          prefetch={false}
          className={cn(
            "inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-sm font-semibold",
            isDark ? "bg-white/10 text-white" : "bg-white/60 text-slate-700"
          )}
        >
          <ArrowLeft className="size-4" />
          Folders
        </Link>
      }
    >
      <p className="mb-3 text-sm">One selection credit per folder. Originals stay on your studio computer.</p>
      <form
        onSubmit={handleSubmit}
        className="space-y-3"
        onDragEnter={(event) => {
          event.preventDefault();
          dragDepth.current += 1;
          setDragOver(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => {
          dragDepth.current -= 1;
          if (dragDepth.current <= 0) {
            dragDepth.current = 0;
            setDragOver(false);
          }
        }}
        onDrop={(event) => {
          event.preventDefault();
          dragDepth.current = 0;
          setDragOver(false);
          toast.info("Click Upload folder to choose your photo folder.");
        }}
      >
        <div className={cn(selectionPanel(isDark), "p-3 sm:p-4")}>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            <div className="grid shrink-0 grid-cols-1 gap-3 sm:grid-cols-3 lg:w-[36rem]">
              {[
                {
                  id: "client-name",
                  label: "Client name",
                  value: clientName,
                  placeholder: "Sunil Kumar",
                  onChange: setClientName,
                },
                {
                  id: "client-phone",
                  label: "WhatsApp number",
                  value: phone,
                  placeholder: "+91 98765 43210",
                  onChange: setPhone,
                },
                {
                  id: "folder-name",
                  label: "Folder name",
                  value: folderName,
                  placeholder: "Wedding ceremony",
                  onChange: setFolderName,
                },
              ].map((field) => (
                <div key={field.id} className="min-w-0 space-y-1.5">
                  <Label htmlFor={field.id} className={labelClass}>
                    {field.label}
                  </Label>
                  <Input
                    id={field.id}
                    value={field.value}
                    onChange={(event) => field.onChange(event.target.value)}
                    placeholder={field.placeholder}
                    className={fieldClass}
                  />
                </div>
              ))}
            </div>

            <label
              className={cn(
                "flex min-h-16 flex-1 cursor-pointer items-center justify-center gap-3 rounded-2xl border border-dashed px-4 py-3 text-center transition",
                dragOver
                  ? isDark
                    ? "border-sky-300/70 bg-sky-400/15"
                    : "border-sky-400 bg-sky-50/80"
                  : isDark
                    ? "border-white/15 bg-white/5 hover:bg-white/10"
                    : "border-slate-300/80 bg-white/45 hover:bg-white/70"
              )}
            >
              <span
                className={cn(
                  "grid size-9 shrink-0 place-items-center rounded-xl",
                  isDark ? "bg-white/10 text-sky-200" : "bg-white text-sky-600 shadow-sm"
                )}
              >
                <ImagePlus className="size-4" />
              </span>
              <span className="min-w-0 text-left">
                <span
                  className={cn(
                    "block text-sm font-semibold",
                    isDark ? "text-white" : "text-slate-900"
                  )}
                >
                  Upload folder
                </span>
                <span
                  className={cn(
                    "mt-0.5 block text-xs",
                    isDark ? "text-slate-400" : "text-slate-500"
                  )}
                >
                  {preparing
                    ? "Preparing photos…"
                    : files.length
                      ? `${files.length} photos selected · click to browse`
                      : "Choose a folder of JPG, PNG, or WebP photos"}
                </span>
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                webkitdirectory=""
                disabled={saving || preparing > 0}
                className="sr-only"
                onChange={(event) => {
                  addFiles(event.target.files);
                  event.target.value = "";
                }}
              />
            </label>
          </div>

          {files.length ? (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {files.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "relative overflow-hidden rounded-2xl border",
                    isDark ? "border-white/10" : "border-white/70"
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.previewUrl}
                    alt={item.file.name}
                    className="aspect-square w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile(item.id)}
                    className="absolute top-2 right-2 grid size-7 place-items-center rounded-full bg-black/55 text-white"
                    aria-label={`Remove ${item.file.name}`}
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : null}

          {files.length ? (
            <div className="mt-4 flex justify-end">
              <Button
                type="submit"
                disabled={saving || preparing > 0}
                className="h-10 rounded-full bg-linear-to-r from-sky-500 to-rose-500 px-5 text-white shadow-none hover:brightness-110"
              >
                {saving || preparing > 0 ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : null}
                {saving ? "Uploading…" : preparing > 0 ? "Preparing…" : "Upload"}
              </Button>
            </div>
          ) : null}
        </div>
      </form>
    </PagePanel>
  );
}
