import { cn } from "@/lib/cn";

export default function BrandMark({ className, light = false }) {
  return (
    <span className={cn("flex items-center gap-3", className)}>
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-linear-to-br from-rose-500 to-pink-500 text-lg font-bold leading-none text-white shadow-lg shadow-rose-500/25">
        R
      </span>
      <span className="flex flex-col leading-tight">
        <span
          className={cn(
            "text-lg font-semibold tracking-tight",
            light ? "text-white" : "text-slate-900",
          )}
        >
          RD Flip
        </span>
        <span
          className={cn(
            "text-[11px] font-medium tracking-[0.2em] uppercase",
            light ? "text-white/60" : "text-slate-500",
          )}
        >
          Flip studio
        </span>
      </span>
    </span>
  );
}
