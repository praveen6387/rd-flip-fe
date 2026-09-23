"use client";

import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { deleteFlipbook } from "@/lib/api/client/flipbook";
import { useDashboardTheme } from "@/lib/dashboard/ThemeProvider";
import { cn } from "@/lib/cn";

export default function FlipbookDeleteDialog({
  flipbook,
  open,
  onOpenChange,
  onDeleted,
}) {
  const { isDark } = useDashboardTheme();
  const [deleting, setDeleting] = useState(false);
  const title = flipbook?.title || "this flipbook";

  function close() {
    if (deleting) return;
    onOpenChange?.(false);
  }

  async function confirmDelete() {
    if (!flipbook?.id) return;

    setDeleting(true);
    try {
      await deleteFlipbook(flipbook.id);
      onDeleted?.(flipbook.id);
      toast.success("Flipbook deleted");
      onOpenChange?.(false);
    } catch (error) {
      toast.error(error?.message || "Failed to delete flipbook");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (deleting) return;
        onOpenChange?.(next);
      }}
    >
      <DialogContent
        showCloseButton={false}
        onInteractOutside={(event) => {
          if (deleting) event.preventDefault();
        }}
        onEscapeKeyDown={(event) => {
          if (deleting) event.preventDefault();
        }}
        className={cn(
          "max-w-[calc(100%-2rem)] gap-0 overflow-hidden rounded-[28px] p-0 shadow-[0_24px_64px_-28px_rgba(15,23,42,0.45)] ring-0 sm:max-w-md",
          isDark ? "bg-[#141b24] text-white" : "bg-white text-slate-900"
        )}
      >
        <div className="flex items-start gap-4 px-6 pt-6 pb-5">
          <span
            className={cn(
              "grid size-11 shrink-0 place-items-center rounded-2xl",
              isDark
                ? "bg-rose-500/15 text-rose-200"
                : "bg-rose-50 text-rose-600"
            )}
          >
            <Trash2 className="size-5" />
          </span>
          <div className="min-w-0 space-y-1.5">
            <DialogTitle
              className={cn(
                "text-[17px] font-semibold tracking-tight",
                isDark ? "text-white" : "text-slate-900"
              )}
            >
              Delete flipbook?
            </DialogTitle>
            <DialogDescription
              className={cn(
                "text-sm leading-6",
                isDark ? "text-slate-400" : "text-slate-600"
              )}
            >
              Delete “{title}”? It will no longer appear in your library or
              public links.
            </DialogDescription>
          </div>
        </div>

        <div
          className={cn(
            "flex items-center justify-end gap-2 border-t px-6 py-4",
            isDark ? "border-white/8" : "border-stone-100"
          )}
        >
          <Button
            type="button"
            disabled={deleting}
            onClick={close}
            className={cn(
              "h-9 rounded-full border-0 px-4 shadow-none",
              isDark
                ? "bg-white/8 text-slate-200 hover:bg-white/12 hover:text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            )}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={deleting}
            onClick={confirmDelete}
            className={cn(
              "h-9 rounded-full border-0 px-4 shadow-none",
              isDark
                ? "bg-rose-500/15 text-rose-200 hover:bg-rose-500/25"
                : "bg-rose-50 text-rose-600 hover:bg-rose-100"
            )}
          >
            {deleting ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Trash2 className="size-3.5" />
            )}
            {deleting ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
