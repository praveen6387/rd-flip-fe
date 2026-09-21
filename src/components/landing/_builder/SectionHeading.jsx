import { cn } from "@/lib/cn";

export default function SectionHeading({
  eyebrow,
  title,
  accent,
  body,
  align = "center",
  isDark = false,
}) {
  return (
    <div
      className={
        align === "left" ? "max-w-2xl text-left" : "mx-auto max-w-3xl text-center"
      }
    >
      {eyebrow ? (
        <p
          className={cn(
            "mb-3 text-sm font-medium uppercase tracking-[0.22em] sm:text-base",
            isDark ? "text-violet-300/80" : "text-indigo-600"
          )}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={cn(
          "font-heading text-4xl font-semibold leading-tight tracking-tight sm:text-5xl",
          isDark ? "text-white" : "text-slate-900"
        )}
      >
        {title}{" "}
        {accent ? (
          <span className="bg-linear-to-r from-rose-500 to-pink-500 bg-clip-text italic text-transparent">
            {accent}
          </span>
        ) : null}
      </h2>
      {body ? (
        <p
          className={cn(
            "mt-5 text-lg leading-8 sm:text-xl sm:leading-9",
            isDark ? "text-slate-300" : "text-slate-600"
          )}
        >
          {body}
        </p>
      ) : null}
    </div>
  );
}
