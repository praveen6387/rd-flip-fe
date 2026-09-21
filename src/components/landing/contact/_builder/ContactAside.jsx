import { cn } from "@/lib/cn";

const NOTES = [
  {
    title: "Free credit",
    body: "Signup includes limited free credit with a short window to use it.",
  },
  {
    title: "Paid books",
    body: "After recharge, created flipbooks and QR links stay open.",
  },
  {
    title: "Find a book",
    body: "Search by client name, date, or studio name in the library.",
  },
];

export default function ContactAside({ isDark = false }) {
  return (
    <aside
      className={cn(
        "rounded-3xl border p-6 shadow-[0_12px_40px_-24px_rgba(79,70,229,0.3)] ring-1 backdrop-blur-xl sm:p-8",
        isDark
          ? "border-white/15 bg-white/8 ring-white/10"
          : "border-white/70 bg-white/45 ring-white/40"
      )}
    >
      <p
        className={cn(
          "text-xs font-semibold tracking-[0.18em] uppercase",
          isDark ? "text-slate-400" : "text-slate-400"
        )}
      >
        Quick notes
      </p>
      <ul className="mt-5 space-y-4">
        {NOTES.map((note) => (
          <li key={note.title}>
            <p
              className={cn(
                "text-base font-semibold",
                isDark ? "text-white" : "text-slate-900"
              )}
            >
              {note.title}
            </p>
            <p
              className={cn(
                "mt-1 text-sm leading-6",
                isDark ? "text-slate-300" : "text-slate-500"
              )}
            >
              {note.body}
            </p>
          </li>
        ))}
      </ul>
    </aside>
  );
}
