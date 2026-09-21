import { cn } from "@/lib/cn";

export default function Glows({ isDark = false }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className={cn(
          "absolute top-10 right-16 h-40 w-40 rounded-full blur-3xl transition-opacity duration-500",
          isDark
            ? "bg-linear-to-br from-violet-500/25 to-fuchsia-500/20 opacity-70"
            : "bg-linear-to-br from-indigo-100 to-sky-100 opacity-70"
        )}
      />
      <div
        className={cn(
          "absolute bottom-16 left-12 h-36 w-36 rounded-full blur-3xl transition-opacity duration-500",
          isDark
            ? "bg-linear-to-br from-emerald-500/20 to-teal-500/15 opacity-60"
            : "bg-linear-to-br from-emerald-100 to-teal-100 opacity-70"
        )}
      />
      <div
        className={cn(
          "absolute top-1/3 left-1/4 h-28 w-28 rounded-full blur-2xl transition-opacity duration-500",
          isDark
            ? "bg-linear-to-br from-rose-500/20 to-pink-500/15 opacity-50"
            : "bg-linear-to-br from-rose-100 to-pink-100 opacity-60"
        )}
      />
      <div
        className={cn(
          "absolute top-[18%] left-[10%] h-[380px] w-[380px] rounded-full blur-2xl",
          isDark
            ? "bg-[radial-gradient(circle,rgba(196,138,158,0.16),transparent_70%)]"
            : "bg-[radial-gradient(circle,rgba(251,191,36,0.18),transparent_70%)]"
        )}
      />
      <div
        className={cn(
          "absolute bottom-[18%] right-[8%] h-[420px] w-[420px] rounded-full blur-2xl",
          isDark
            ? "bg-[radial-gradient(circle,rgba(143,86,120,0.2),transparent_70%)]"
            : "bg-[radial-gradient(circle,rgba(244,114,182,0.16),transparent_70%)]"
        )}
      />
    </div>
  );
}
