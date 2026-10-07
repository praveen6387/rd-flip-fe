import { cn } from "@/lib/cn";

export default function BrandMark({ className, light = false, compact = false }) {
  return (
    <span className={cn("flex items-center", className)}>
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-linear-to-br from-[#6d3d5c] to-[#8f5678] text-lg font-bold leading-none text-white shadow-lg shadow-[#6d3d5c]/30">
        R
      </span>
      <span
        className={cn(
          "flex flex-col overflow-hidden leading-tight whitespace-nowrap transition-[max-width,opacity,margin] duration-300 ease-in-out",
          compact ? "ml-0 max-w-0 opacity-0" : "ml-3 max-w-40 opacity-100"
        )}
      >
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
            light ? "text-white/60" : "text-[#5a324c]/80",
          )}
        >
          Flip studio
        </span>
      </span>
    </span>
  );
}
