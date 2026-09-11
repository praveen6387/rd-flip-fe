"use client";

export default function ViewerLandingLoader({
  progress = 0,
  studioName = "RD Flip",
  title = "Flipbook",
}) {
  const percent = Math.round(Math.min(1, Math.max(0, progress)) * 100);

  return (
    <div
      className="grid flex-1 place-items-center px-6"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={`Loading album ${percent}%`}
    >
      <div className="flex w-full max-w-xs flex-col items-center text-center">
        <p className="text-[10px] font-medium tracking-[0.22em] text-amber-200/80 uppercase">
          {studioName}
        </p>
        <h2 className="mt-2 font-heading text-xl tracking-tight text-white sm:text-2xl">
          {title}
        </h2>
        <p className="mt-3 text-[11px] tracking-[0.18em] text-amber-100/70 uppercase">
          Loading album
        </p>

        <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-amber-400 transition-[width] duration-200 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="mt-3 tabular-nums text-[11px] tracking-[0.16em] text-white/45">
          {percent}%
        </p>
      </div>
    </div>
  );
}
