"use client";

import { useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Copy, Download } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/cn";
import {
  DEFAULT_QR_COLOR_ID,
  DEFAULT_QR_DESIGN_ID,
  QR_COLORS,
  QR_DESIGNS,
  getQrColor,
} from "./qrStyles";
import { QrDesignCard } from "./QrDesignCards";

const EXPORT_WIDTH = 320;
const EXPORT_HEIGHT = Math.round((EXPORT_WIDTH * 4.35) / 3);
/** Higher = sharper PNG (print-friendly). */
const EXPORT_SCALE = 3;

function formatDate(value) {
  if (!value) return null;
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function flipbookPublicUrl(flipId) {
  if (typeof window === "undefined") {
    return ROUTES.flipbookView(flipId);
  }
  return `${window.location.origin}${ROUTES.flipbookView(flipId)}`;
}

function slugify(value) {
  return String(value || "flipbook")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

function ScrollChips({ label, children }) {
  return (
    <div className="min-w-0 shrink-0">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-[11px] font-medium tracking-[0.16em] text-slate-500 uppercase">
          {label}
        </p>
        <p className="text-[10px] font-medium tracking-wide text-slate-400">
          scroll for more →
        </p>
      </div>
      <div className="w-full overflow-x-auto overscroll-x-contain pb-1 [-webkit-overflow-scrolling:touch] [scrollbar-width:thin]">
        <div className="flex w-max gap-2 pr-1">{children}</div>
      </div>
    </div>
  );
}

export default function FlipbookQrDialog({ flipbook, open, onOpenChange }) {
  const cardRef = useRef(null);
  const [designId, setDesignId] = useState(DEFAULT_QR_DESIGN_ID);
  const [colorId, setColorId] = useState(DEFAULT_QR_COLOR_ID);
  const [downloading, setDownloading] = useState(false);
  const color = getQrColor(colorId);

  const url = useMemo(() => {
    if (!flipbook?.flip_id) return "";
    return flipbookPublicUrl(flipbook.flip_id);
  }, [flipbook?.flip_id]);

  const dateLabel = formatDate(flipbook?.date);
  const title = flipbook?.title || "Untitled";
  const studioName = flipbook?.studio_name || "";

  async function copyLink() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Flipbook link copied");
    } catch {
      toast.error("Could not copy link");
    }
  }

  async function downloadCard() {
    if (!cardRef.current || !flipbook?.flip_id) return;
    setDownloading(true);

    const bg = designId === "frosted" ? color.frostedBg : color.cardBg;
    const outW = EXPORT_WIDTH * EXPORT_SCALE;
    const outH = EXPORT_HEIGHT * EXPORT_SCALE;
    const host = document.createElement("div");
    host.setAttribute("aria-hidden", "true");
    host.style.cssText = [
      "position:fixed",
      "left:-10000px",
      "top:0",
      `width:${outW}px`,
      `height:${outH}px`,
      "overflow:hidden",
      "pointer-events:none",
      "z-index:-1",
      "opacity:1",
    ].join(";");

    try {
      const clone = cardRef.current.cloneNode(true);
      clone.style.width = `${EXPORT_WIDTH}px`;
      clone.style.maxWidth = `${EXPORT_WIDTH}px`;
      clone.style.height = `${EXPORT_HEIGHT}px`;
      clone.style.aspectRatio = "auto";
      clone.style.transform = `scale(${EXPORT_SCALE})`;
      clone.style.transformOrigin = "top left";
      clone.style.margin = "0";
      clone.style.boxShadow = "none";
      host.appendChild(clone);
      document.body.appendChild(host);

      if (document.fonts?.ready) {
        await document.fonts.ready;
      }
      await new Promise((resolve) => requestAnimationFrame(() => resolve()));

      const dataUrl = await toPng(clone, {
        cacheBust: true,
        pixelRatio: 1,
        backgroundColor: bg,
        width: outW,
        height: outH,
        canvasWidth: outW,
        canvasHeight: outH,
        style: {
          width: `${EXPORT_WIDTH}px`,
          height: `${EXPORT_HEIGHT}px`,
          transform: `scale(${EXPORT_SCALE})`,
          transformOrigin: "top left",
          margin: "0",
        },
      });

      const link = document.createElement("a");
      link.download = `${slugify(title)}-qr-${designId}-${color.id}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("QR card downloaded");
    } catch {
      toast.error("Could not download QR card");
    } finally {
      host.remove();
      setDownloading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="flex max-h-[min(92dvh,900px)] w-full max-w-md flex-col gap-4 overflow-hidden border-stone-200/70 bg-[#f7f4ef] p-5 sm:max-w-lg sm:p-6"
      >
        <DialogHeader className="shrink-0 pr-8">
          <DialogTitle className="text-slate-900">QR code</DialogTitle>
          <DialogDescription className="text-slate-600">
            Pick a design and color, then download the card for print or share.
          </DialogDescription>
        </DialogHeader>

        {flipbook ? (
          <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-hidden">
            <ScrollChips label="Design">
              {QR_DESIGNS.map((item) => {
                const active = designId === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setDesignId(item.id)}
                    className={cn(
                      "inline-flex shrink-0 cursor-pointer flex-col rounded-xl border px-4 py-2 text-left transition space-x-2",
                      active
                        ? "border-stone-800 bg-stone-900 text-white"
                        : "border-stone-300 bg-white text-slate-700 hover:bg-stone-50"
                    )}
                  >
                    <span className="text-xs font-semibold whitespace-nowrap">
                      {item.label}
                    </span>
                    <span
                      className={cn(
                        "mt-0.5 text-[10px] whitespace-nowrap",
                        active ? "text-white/70" : "text-slate-500"
                      )}
                    >
                      {item.description}
                    </span>
                  </button>
                );
              })}
            </ScrollChips>

            <ScrollChips label="Color">
              {QR_COLORS.map((item) => {
                const active = colorId === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setColorId(item.id)}
                    className={cn(
                      "inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium whitespace-nowrap transition",
                      active
                        ? "border-stone-800 bg-stone-900 text-white"
                        : "border-stone-300 bg-white text-slate-600 hover:bg-stone-50"
                    )}
                  >
                    <span
                      className="size-2.5 rounded-full ring-1 ring-black/10"
                      style={{ backgroundColor: item.swatch }}
                    />
                    {item.label}
                  </button>
                );
              })}
            </ScrollChips>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-1">
              <QrDesignCard
                designId={designId}
                cardRef={cardRef}
                color={color}
                url={url}
                title={title}
                dateLabel={dateLabel}
                studioName={studioName}
              />
            </div>

            <div className="flex shrink-0 flex-wrap gap-2 justify-end">
              <button
                type="button"
                onClick={copyLink}
                className="inline-flex h-9 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 text-xs font-medium text-slate-800 transition hover:bg-stone-50 sm:flex-none"
              >
                <Copy className="size-3.5" />
                Copy link
              </button>
              <button
                type="button"
                onClick={downloadCard}
                disabled={downloading}
                className="inline-flex h-9 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-stone-800 bg-stone-900 px-3 text-xs font-medium text-white transition hover:bg-stone-800 disabled:cursor-wait disabled:opacity-70 sm:flex-none"
              >
                <Download className="size-3.5" />
                {downloading ? "Downloading…" : "Download"}
              </button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
