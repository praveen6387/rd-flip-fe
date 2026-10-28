"use client";

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FolderOpen, ImagePlus, Images, Phone } from "lucide-react";
import PagePanel from "@/components/dashboard/_builder/PagePanel";
import { useDashboardTheme } from "@/lib/dashboard/ThemeProvider";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/cn";
import { formatSelectionDate, selectionPanel, selectionStatus, selectionStatusClass } from "./_builder/panel";

export default function PhotoSelection({ albums = [], error = null }) {
  const { isDark } = useDashboardTheme();
  const router = useRouter();
  const status = error ? "error" : "ready";

  const count = albums.length;

  return (
    <PagePanel
      title="Photo Selection"
      description={
        status === "ready" && count
          ? `${count} folder${count === 1 ? "" : "s"} ready to review.`
          : "Create a client folder and upload the photos you want to review."
      }
      actions={
        <Link
          href={ROUTES.dashboardPhotoSelectionNew}
          prefetch={false}
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-linear-to-r from-sky-500 to-rose-500 px-5 text-sm font-semibold text-white transition hover:brightness-110 active:scale-[0.98]"
        >
          <ImagePlus className="size-4" strokeWidth={2.25} />
          New folder
        </Link>
      }
    >
      {status === "error" ? (
        <div
          className={cn(
            "rounded-2xl border px-5 py-8 text-center text-sm",
            isDark
              ? "border-rose-400/30 bg-rose-500/10 text-rose-100"
              : "border-rose-200/80 bg-rose-50/80 text-rose-700"
          )}
        >
          <p>{error}</p>
          <button type="button" onClick={() => router.refresh()} className="mt-3 font-semibold underline">Try again</button>
        </div>
      ) : null}

      {status === "ready" && count === 0 ? (
        <div
          className={cn(
            selectionPanel(isDark),
            "border-dashed px-5 py-12 text-center"
          )}
        >
          <span
            className={cn(
              "mx-auto grid size-12 place-items-center rounded-2xl",
              isDark ? "bg-white/10 text-sky-200" : "bg-white/70 text-sky-600"
            )}
          >
            <Images className="size-5" />
          </span>
          <p
            className={cn(
              "mt-4 text-sm font-semibold",
              isDark ? "text-white" : "text-slate-900"
            )}
          >
            No selection folders yet
          </p>
          <p
            className={cn(
              "mt-2 text-sm",
              isDark ? "text-slate-300" : "text-slate-600"
            )}
          >
            Add a client folder and upload the photos for that selection.
          </p>
        </div>
      ) : null}

      {status === "ready" && count > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {albums.map((album) => {
            const folderStatus = selectionStatus(album);
            return (
            <article
              key={album.id}
              className={cn(selectionPanel(isDark), "flex flex-col p-4")}
            >
              <Link href={ROUTES.dashboardPhotoSelectionView(album.id)} prefetch={false} className="block rounded-2xl transition hover:opacity-90">
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      "grid size-11 shrink-0 place-items-center rounded-2xl",
                      isDark ? "bg-white/10 text-sky-200" : "bg-white/70 text-sky-600"
                    )}
                  >
                    <FolderOpen className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn("truncate text-base font-semibold", isDark ? "text-white" : "text-slate-900")}>
                        {album.folderName}
                      </p>
                      <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold", selectionStatusClass(album.status, isDark))}>
                        {folderStatus.label}
                      </span>
                    </div>
                    <p className={cn("mt-0.5 truncate text-sm", isDark ? "text-slate-300" : "text-slate-600")}>
                      {album.clientName}
                    </p>
                  </div>
                </div>
                <div className={cn("mt-4 flex items-center justify-between gap-3 text-xs", isDark ? "text-slate-400" : "text-slate-500")}>
                  <span className="inline-flex min-w-0 items-center gap-1.5">
                    <Phone className="size-3.5 shrink-0" />
                    <span className="truncate">{album.phone || "No phone"}</span>
                  </span>
                  <span className="shrink-0">{album.photoCount} photo{album.photoCount === 1 ? "" : "s"}</span>
                </div>
                <p className={cn("mt-2 text-xs", isDark ? "text-slate-400" : "text-slate-500")}>
                  {folderStatus.hint} · Uploaded {formatSelectionDate(album.createdAt)}
                </p>
              </Link>
              <div className={cn("mt-4 rounded-xl px-3 py-2", isDark ? "bg-white/5" : "bg-white/60")}>
                <p className={cn("text-[11px] font-medium tracking-wide uppercase", isDark ? "text-slate-400" : "text-slate-500")}>Client code</p>
                <p className={cn("mt-0.5 font-mono text-lg font-semibold tracking-[0.28em]", isDark ? "text-white" : "text-slate-900")}>{album.accessCode}</p>
              </div>
              {album.status !== "draft" && album.shareToken ? (
                <div className={cn("mt-3 flex flex-wrap gap-2 border-t pt-3", isDark ? "border-white/10" : "border-slate-200/80")}>
                  <button
                    type="button"
                    className="rounded-full px-3 py-1.5 text-xs font-semibold text-sky-600 hover:bg-sky-500/10"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(`${window.location.origin}/photo-selection/${album.shareToken}`);
                        toast.success("Client selection link copied");
                      } catch { toast.error("Could not copy the link. Open the client page to copy its address."); }
                    }}
                  >Copy client link</button>
                  <button type="button" className="rounded-full px-3 py-1.5 text-xs font-semibold text-sky-600 hover:bg-sky-500/10" onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(`Select your photos: ${window.location.origin}/photo-selection\nCode: ${album.accessCode}`);
                      toast.success("Client code and access link copied");
                    } catch { toast.error("Could not copy the code."); }
                  }}>Copy code and entry link</button>
                  <Link href={`/photo-selection/${album.shareToken}`} target="_blank" rel="noopener noreferrer" className="rounded-full px-3 py-1.5 text-xs font-semibold text-sky-600 hover:bg-sky-500/10">Open client page</Link>
                </div>
              ) : <p className={cn("mt-3 text-xs", isDark ? "text-slate-400" : "text-slate-500")}>Finish uploading this folder to enable its client link.</p>}
            </article>
            );
          })}
        </div>
      ) : null}
    </PagePanel>
  );
}
