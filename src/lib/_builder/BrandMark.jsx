import { cn } from "@/lib/cn";

export default function BrandMark({ className }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <span className="grid h-9 w-9 place-items-center rounded-lg border border-[#d4af37] text-[17px] font-semibold leading-none text-[#f3e6c0] shadow-[0_0_12px_rgba(212,175,55,0.25)]">
        R
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-[15px] font-semibold tracking-tight text-white">RD Flip</span>
        <span className="text-[9px] font-medium tracking-[0.22em] text-white/55 uppercase">
          Flip studio
        </span>
      </span>
    </span>
  );
}
