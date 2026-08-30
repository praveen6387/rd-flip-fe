"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, GripVertical, ImagePlus, X } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/cn";
import { isAcceptedImage, optimizeImage } from "./optimizeImage";

export const IMAGE_LIMITS = {
  total: 60,
};

const ZONES = [
  {
    key: "front",
    title: "Front cover",
    hint: "First pages of the book",
  },
  {
    key: "back",
    title: "Back cover",
    hint: "Closing pages",
  },
  {
    key: "middle",
    title: "Middle pages",
    hint: "The story inside",
  },
];

function createItemId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function totalCount(covers) {
  return covers.front.length + covers.back.length + covers.middle.length;
}

function formatSize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ImageCovers({ covers, onChange, isDark }) {
  const [progress, setProgress] = useState(null);
  const [dragging, setDragging] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  const coversRef = useRef(covers);
  coversRef.current = covers;

  useEffect(() => {
    return () => {
      const current = coversRef.current;
      [...current.front, ...current.back, ...current.middle].forEach((item) => {
        URL.revokeObjectURL(item.previewUrl);
      });
    };
  }, []);

  async function addFiles(zone, fileList) {
    const files = Array.from(fileList || []);
    if (!files.length || progress) return;

    const room = IMAGE_LIMITS.total - (totalCount(covers) - covers[zone].length);

    if (room <= 0) {
      toast.error("You can upload about 60 photos in total.");
      return;
    }

    const queued = [];
    for (const file of files) {
      if (queued.length >= room) break;
      if (!isAcceptedImage(file)) {
        toast.error(`${file.name} isn’t a JPG, PNG, or WebP.`);
        continue;
      }
      queued.push(file);
    }

    if (!queued.length) return;

    if (queued.length < files.length && files.length > room) {
      toast.error(`Only ${room} more photo${room === 1 ? "" : "s"} fit in the 60 total.`);
    }

    const created = [];
    try {
      for (let index = 0; index < queued.length; index += 1) {
        const file = queued[index];
        const optimized = await optimizeImage(file, {
          onProgress: (filePercent) => {
            const overall = Math.round(
              ((index + filePercent / 100) / queued.length) * 100
            );
            setProgress({
              percent: overall,
              current: index + 1,
              total: queued.length,
              name: file.name,
            });
          },
        });
        created.push({
          id: createItemId(),
          name: file.name,
          previewUrl: URL.createObjectURL(optimized.blob),
          blob: optimized.blob,
          width: optimized.width,
          height: optimized.height,
        });
        await new Promise((resolve) => setTimeout(resolve, 0));
      }

      covers[zone].forEach((item) => URL.revokeObjectURL(item.previewUrl));
      onChange({
        ...covers,
        [zone]: created,
      });
    } catch (error) {
      created.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      toast.error(error.message || "Could not optimize those photos.");
    } finally {
      setProgress(null);
    }
  }

  function removeItem(zone, id) {
    const item = covers[zone].find((entry) => entry.id === id);
    if (item) URL.revokeObjectURL(item.previewUrl);
    onChange({
      ...covers,
      [zone]: covers[zone].filter((entry) => entry.id !== id),
    });
  }

  function moveItem(zone, index, direction) {
    const nextIndex = index + direction;
    const list = covers[zone];
    if (nextIndex < 0 || nextIndex >= list.length) return;
    const next = list.slice();
    const [item] = next.splice(index, 1);
    next.splice(nextIndex, 0, item);
    onChange({ ...covers, [zone]: next });
  }

  function handleDrop(targetZone, targetIndex) {
    if (!dragging) return;

    const fromList = covers[dragging.zone].slice();
    const [item] = fromList.splice(dragging.index, 1);
    if (!item) return;

    if (dragging.zone === targetZone) {
      const next = fromList;
      const insertAt =
        dragging.index < targetIndex ? targetIndex - 1 : targetIndex;
      next.splice(Math.max(0, insertAt), 0, item);
      onChange({ ...covers, [targetZone]: next });
    } else {
      const toList = covers[targetZone].slice();
      toList.splice(targetIndex, 0, item);
      onChange({
        ...covers,
        [dragging.zone]: fromList,
        [targetZone]: toList,
      });
    }

    setDragging(null);
    setDropTarget(null);
  }

  const used = totalCount(covers);

  return (
    <section
      className={cn(
        "relative space-y-5 rounded-[1.6rem] border p-5 sm:p-6",
        isDark
          ? "border-white/25 bg-white/[0.04]"
          : "border-stone-300/55 bg-white/20"
      )}
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
            <h3
            className={cn(
              "text-base font-semibold tracking-tight",
              isDark ? "text-white" : "text-slate-900"
            )}
          >
            Photos
          </h3>
          <p
            className={cn(
              "mt-1 text-sm",
              isDark ? "text-slate-300" : "text-slate-600"
            )}
          >
            Front, then back, then the middle pages. A new upload in a section
            replaces the photos already there.
          </p>
        </div>
        <p
          className={cn(
            "text-sm font-medium",
            isDark ? "text-slate-200" : "text-slate-700"
          )}
        >
          {used} / {IMAGE_LIMITS.total} photos
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5">
        {ZONES.map((zone) => (
          <CoverZone
            key={zone.key}
            zone={zone}
            images={covers[zone.key]}
            isDark={isDark}
            dense={zone.key === "middle"}
            disabled={Boolean(progress)}
            canAdd={
              used - covers[zone.key].length < IMAGE_LIMITS.total
            }
            dragging={dragging}
            dropTarget={dropTarget}
            onFiles={(files) => addFiles(zone.key, files)}
            onRemove={(id) => removeItem(zone.key, id)}
            onMove={(index, direction) => moveItem(zone.key, index, direction)}
            onDragStart={(index) => setDragging({ zone: zone.key, index })}
            onDragOverIndex={(index) =>
              setDropTarget({ zone: zone.key, index })
            }
            onDropAt={(index) => handleDrop(zone.key, index)}
            onDragEnd={() => {
              setDragging(null);
              setDropTarget(null);
            }}
          />
        ))}
      </div>

      {progress ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-[1.6rem] bg-black/45 p-6 backdrop-blur-sm">
          <div
            className={cn(
              "w-full max-w-sm rounded-2xl border px-5 py-5",
              isDark
                ? "border-white/15 bg-slate-900/90 text-white"
                : "border-white/70 bg-white/95 text-slate-900"
            )}
          >
            <p className="text-[11px] font-medium tracking-[0.18em] uppercase text-sky-600">
              Optimizing
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">
              {progress.percent}%
            </p>
            <p
              className={cn(
                "mt-1 truncate text-sm",
                isDark ? "text-slate-300" : "text-slate-500"
              )}
            >
              {progress.current} of {progress.total} · {progress.name}
            </p>
            <Progress value={progress.percent} className="mt-4 h-1.5" />
          </div>
        </div>
      ) : null}
    </section>
  );
}

function CoverZone({
  zone,
  images,
  isDark,
  dense,
  disabled,
  canAdd,
  dragging,
  dropTarget,
  onFiles,
  onRemove,
  onMove,
  onDragStart,
  onDragOverIndex,
  onDropAt,
  onDragEnd,
}) {
  const inputRef = useRef(null);

  return (
    <div
      className={cn(
        "rounded-[1.35rem] border p-4",
        isDark
          ? "border-white/20 bg-white/[0.03]"
          : "border-stone-300/50 bg-white/25"
      )}
      onDragOver={(event) => {
        event.preventDefault();
        if (images.length === 0) onDragOverIndex(0);
      }}
      onDrop={(event) => {
        event.preventDefault();
        if (event.dataTransfer.files?.length) {
          onFiles(event.dataTransfer.files);
          return;
        }
        onDropAt(images.length);
      }}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h4
            className={cn(
              "text-sm font-semibold",
              isDark ? "text-white" : "text-slate-900"
            )}
          >
            {zone.title}
          </h4>
          <p
            className={cn(
              "mt-0.5 text-xs",
              isDark ? "text-slate-300" : "text-slate-600"
            )}
          >
            {zone.hint}
            {images.length ? ` · ${images.length} added` : ""}
          </p>
        </div>
        <button
          type="button"
          disabled={disabled || !canAdd}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-3 text-xs font-medium transition disabled:cursor-not-allowed",
            isDark
              ? "bg-white/10 text-white hover:bg-white/16 disabled:opacity-40"
              : "bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-40"
          )}
        >
          <ImagePlus className="size-3.5" />
          {images.length ? "Replace" : "Add"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="sr-only"
          onChange={(event) => {
            onFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </div>

      {images.length === 0 ? (
        <button
          type="button"
          disabled={disabled || !canAdd}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex min-h-28 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-4 text-center text-sm transition disabled:cursor-not-allowed",
            isDark
              ? "border-white/20 text-slate-400 hover:border-white/35 hover:bg-white/5"
              : "border-stone-300 text-slate-500 hover:border-stone-400 hover:bg-white/50"
          )}
        >
          Drop photos here or click to upload
        </button>
      ) : (
        <ul
          className={cn(
            "grid gap-2.5",
            dense
              ? "grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6"
              : "grid-cols-3 sm:grid-cols-4"
          )}
        >
          {images.map((image, index) => {
            const isDrop =
              dropTarget?.zone === zone.key && dropTarget.index === index;
            const isDrag =
              dragging?.zone === zone.key && dragging.index === index;

            return (
              <li
                key={image.id}
                draggable={!disabled}
                onDragStart={() => onDragStart(index)}
                onDragOver={(event) => {
                  event.preventDefault();
                  onDragOverIndex(index);
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onDropAt(index);
                }}
                onDragEnd={onDragEnd}
                className={cn(
                  "group relative aspect-[4/3] overflow-hidden rounded-xl border bg-black/10",
                  isDark ? "border-white/15" : "border-white/70",
                  isDrop && "ring-2 ring-sky-400",
                  isDrag && "opacity-50"
                )}
              >
                <img
                  src={image.previewUrl}
                  alt={image.name}
                  className="size-full object-cover"
                />
                <span className="absolute top-1.5 left-1.5 rounded-md bg-black/55 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  {index + 1}
                </span>
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-linear-to-t from-black/70 to-transparent px-1 py-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
                  <span className="hidden cursor-grab text-white/80 sm:inline">
                    <GripVertical className="size-3.5" />
                  </span>
                  <div className="ml-auto flex items-center gap-0.5">
                    <button
                      type="button"
                      aria-label="Move earlier"
                      disabled={index === 0}
                      onClick={() => onMove(index, -1)}
                      className="grid size-6 place-items-center rounded-md text-white hover:bg-white/15 disabled:opacity-30"
                    >
                      <ChevronLeft className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      aria-label="Move later"
                      disabled={index === images.length - 1}
                      onClick={() => onMove(index, 1)}
                      className="grid size-6 place-items-center rounded-md text-white hover:bg-white/15 disabled:opacity-30"
                    >
                      <ChevronRight className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      aria-label="Remove photo"
                      onClick={() => onRemove(image.id)}
                      className="grid size-6 place-items-center rounded-md text-white hover:bg-rose-500/80"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                </div>
                <p className="sr-only">{formatSize(image.blob.size)}</p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
