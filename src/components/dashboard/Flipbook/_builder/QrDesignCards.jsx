"use client";

import { Great_Vibes } from "next/font/google";
import { QRCodeSVG } from "qrcode.react";
import { cn } from "@/lib/cn";
import {
  QrCameraIcon,
  QrCornerBranch,
  QrLeafBottom,
  QrLeafTop,
} from "./QrLeafAccent";

const greatVibes = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const CARD_SHELL =
  "relative mx-auto flex w-[320px] max-w-full shrink-0 flex-col overflow-hidden rounded-sm shadow-[0_20px_60px_-28px_rgba(15,23,42,0.45)] ring-1 ring-stone-200/80";

function QrBlock({ url, size = 148 }) {
  return (
    <div className="grid place-items-center rounded-sm bg-white p-2">
      <QRCodeSVG
        value={url}
        size={size}
        level="M"
        bgColor="#ffffff"
        fgColor="#111111"
        marginSize={0}
      />
    </div>
  );
}

function InfoLines({ title, dateLabel, studioName, color, className, align }) {
  return (
    <div className={cn("max-w-[92%]", align === "right" && "text-right", className)}>
      {title ? (
        <p
          className="truncate font-heading text-sm font-semibold tracking-tight"
          style={{ color }}
        >
          {title}
        </p>
      ) : null}
      {dateLabel || studioName ? (
        <p
          className="mt-0.5 text-[11px] leading-relaxed"
          style={{ color, opacity: 0.8 }}
        >
          {[dateLabel, studioName].filter(Boolean).join(" · ")}
        </p>
      ) : null}
    </div>
  );
}

/** Image 1 — floral share the love */
export function CardShareLove({ cardRef, color, url, title, dateLabel, studioName }) {
  return (
    <div
      ref={cardRef}
      className={cn(CARD_SHELL, "items-center px-6 pt-5 pb-8")}
      style={{ aspectRatio: "3 / 4.35", backgroundColor: color.cardBg }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0">
        <QrLeafTop className="h-auto w-full" variant={color.accent} />
      </div>
      <div className="relative z-10 mt-14 flex w-full flex-1 flex-col items-center">
        <p
          className={cn(greatVibes.className, "text-center text-[2.4rem] leading-none")}
          style={{ color: color.ink }}
        >
          share the love
        </p>
        <InfoLines
          title={title}
          dateLabel={dateLabel}
          studioName={studioName}
          color={color.muted}
          className="mt-3 text-center"
          align="center"
        />
        <div className="mt-5">
          <QrBlock url={url} size={152} />
        </div>
        <p
          className="mt-5 text-center font-heading text-[11px] leading-[1.55] tracking-[0.14em] uppercase"
          style={{ color: color.ink }}
        >
          <span className="block">PLEASE SCAN</span>
          <span className="block">THIS CODE TO OPEN &</span>
          <span className="block">VIEW THIS FLIPBOOK</span>
        </p>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center">
        <QrLeafBottom className="h-12 w-auto" variant={color.accent} />
      </div>
    </div>
  );
}

/** Image 2 — frosted acrylic */
export function CardFrosted({ cardRef, color, url, title, dateLabel, studioName }) {
  const ink = color.frostedInk;
  return (
    <div
      ref={cardRef}
      className={cn(CARD_SHELL, "items-center px-6 py-8")}
      style={{ aspectRatio: "3 / 4.35", backgroundColor: color.frostedBg }}
    >
      <div className="relative z-10 flex w-full flex-1 flex-col items-center text-center">
        <div className="flex items-start justify-center gap-2">
          <p
            className={cn(greatVibes.className, "text-[2.2rem] leading-none")}
            style={{ color: ink }}
          >
            Capture the love
          </p>
          <QrCameraIcon className="mt-1 size-9 shrink-0" color={ink} />
        </div>
        <p
          className="mt-4 max-w-[16rem] text-[10px] leading-relaxed tracking-[0.12em] uppercase"
          style={{ color: ink }}
        >
          Please open this flipbook. Simply scan with phone to view.
        </p>
        <div className="mt-6">
          <QrBlock url={url} size={150} />
        </div>
        <div className="mt-auto pt-8">
          <p
            className={cn(greatVibes.className, "text-[1.7rem] leading-none")}
            style={{ color: ink }}
          >
            {title}
          </p>
          {(dateLabel || studioName) && (
            <p
              className="mt-2 text-[11px] tracking-[0.08em]"
              style={{ color: ink, opacity: 0.9 }}
            >
              {[dateLabel, studioName].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/** Image 3 — SHARE YOUR shots */
export function CardShareShots({ cardRef, color, url, title, dateLabel, studioName }) {
  return (
    <div
      ref={cardRef}
      className={cn(CARD_SHELL, "items-center px-6 py-7")}
      style={{ aspectRatio: "3 / 4.35", backgroundColor: color.cardBg }}
    >
      <div className="relative z-10 flex w-full flex-1 flex-col items-center text-center">
        <p
          className="font-heading text-[13px] tracking-[0.28em] uppercase"
          style={{ color: color.ink }}
        >
          SHARE YOUR
        </p>
        <div className="mt-2 flex items-center gap-3">
          <QrCameraIcon className="size-12" color={color.ink} />
          <p
            className={cn(greatVibes.className, "text-[2.6rem] leading-none")}
            style={{ color: color.ink }}
          >
            shots
          </p>
        </div>
        <p
          className="mt-4 max-w-[15rem] text-[10px] leading-relaxed tracking-[0.12em] uppercase"
          style={{ color: color.ink }}
        >
          Scan the QR code with your phone and open this flipbook
        </p>
        <p
          className={cn(greatVibes.className, "mt-3 text-[1.35rem] leading-none")}
          style={{ color: color.ink }}
        >
          help us capture the memories!
        </p>
        <InfoLines
          title={title}
          dateLabel={dateLabel}
          studioName={studioName}
          color={color.muted}
          className="mt-4 text-center"
          align="center"
        />
        <div className="mt-auto pt-5">
          <QrBlock url={url} size={140} />
        </div>
      </div>
    </div>
  );
}

/** Image 4 — Capture THE MOMENT */
export function CardCaptureMoment({
  cardRef,
  color,
  url,
  title,
  dateLabel,
  studioName,
}) {
  return (
    <div
      ref={cardRef}
      className={cn(CARD_SHELL, "px-6 pt-4 pb-6")}
      style={{ aspectRatio: "3 / 4.35", backgroundColor: color.cardBg }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0">
        <QrLeafTop className="h-auto w-full opacity-90" variant={color.accent} />
      </div>
      <div className="relative z-10 mt-12 flex w-full flex-1 flex-col items-center">
        <p
          className={cn(greatVibes.className, "text-[2.2rem] leading-none")}
          style={{ color: color.ink }}
        >
          Capture
        </p>
        <p
          className="mt-1 text-[12px] tracking-[0.35em] uppercase"
          style={{ color: color.ink }}
        >
          THE MOMENT
        </p>
        <QrCameraIcon className="mt-4 size-10" color={color.ink} />
        <p
          className="mt-3 max-w-[15rem] text-center text-[9px] leading-relaxed tracking-[0.14em] uppercase"
          style={{ color: color.ink }}
        >
          Please share your precious pictures with us by scanning this QR code
        </p>
        <div className="mt-5 flex flex-col items-stretch">
          <QrBlock url={url} size={150} />
          <div className="mt-4 text-left">
            <p
              className="truncate font-heading text-sm font-bold tracking-wide uppercase"
              style={{ color: color.ink }}
            >
              {title}
            </p>
            {(dateLabel || studioName) && (
              <p className="mt-1 text-[11px]" style={{ color: color.muted }}>
                {[dateLabel, studioName].filter(Boolean).join(" · ")}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Images 5–6 — CAPTURE the love + corner leaves */
export function CardCaptureLove({
  cardRef,
  color,
  url,
  title,
  dateLabel,
  studioName,
}) {
  return (
    <div
      ref={cardRef}
      className={cn(CARD_SHELL, "px-6 py-7")}
      style={{ aspectRatio: "3 / 4.35", backgroundColor: color.cardBg }}
    >
      <div className="pointer-events-none absolute top-0 left-0 w-[42%]">
        <QrCornerBranch className="h-auto w-full" variant={color.accent} />
      </div>
      <div className="pointer-events-none absolute right-0 bottom-0 w-[42%]">
        <QrCornerBranch className="h-auto w-full" variant={color.accent} flip />
      </div>

      <div className="relative z-10 flex w-full flex-1 flex-col items-center text-center">
        <div className="flex items-center gap-2">
          <QrCameraIcon className="size-8" color={color.ink} />
          <div className="text-left leading-none">
            <p
              className="text-[13px] font-bold tracking-[0.08em] uppercase"
              style={{ color: color.ink }}
            >
              CAPTURE
            </p>
            <p className="text-[10px]" style={{ color: color.muted }}>
              the{" "}
              <span
                className={cn(greatVibes.className, "text-[1.8rem] leading-none")}
                style={{ color: color.ink }}
              >
                love
              </span>
            </p>
          </div>
        </div>

        <div className="mt-6">
          <QrBlock url={url} size={156} />
        </div>

        <p
          className="mt-5 text-[11px] font-semibold tracking-[0.12em] uppercase"
          style={{ color: color.ink }}
        >
          SHARE THIS FLIPBOOK WITH US!
        </p>
        <p
          className="mt-1 max-w-[15rem] text-[9px] leading-relaxed tracking-[0.1em] uppercase"
          style={{ color: color.muted }}
        >
          Scan the code with your smartphone & open the album
        </p>

        <div className="mt-auto pt-6">
          <p
            className={cn(greatVibes.className, "text-[1.45rem] leading-none")}
            style={{ color: color.ink }}
          >
            {title}
          </p>
          {(dateLabel || studioName) && (
            <p className="mt-1.5 text-[11px]" style={{ color: color.muted }}>
              {[dateLabel, studioName].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function QrDesignCard(props) {
  switch (props.designId) {
    case "frosted":
      return <CardFrosted {...props} />;
    case "share-shots":
      return <CardShareShots {...props} />;
    case "capture-moment":
      return <CardCaptureMoment {...props} />;
    case "capture-love":
      return <CardCaptureLove {...props} />;
    case "share-love":
    default:
      return <CardShareLove {...props} />;
  }
}
