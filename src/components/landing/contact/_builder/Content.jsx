import { cn } from "@/lib/cn";
import ContactForm from "./ContactForm";
import ContactAside from "./ContactAside";

export default function Content({ isDark = false }) {
  return (
    <div>
      <div className="max-w-xl">
        <p
          className={cn(
            "text-sm font-medium uppercase tracking-[0.22em] sm:text-base",
            isDark ? "text-violet-300/80" : "text-indigo-600"
          )}
        >
          Contact
        </p>
        <h2
          className={cn(
            "mt-4 font-heading text-4xl leading-tight sm:text-5xl",
            isDark ? "text-white" : "text-slate-900"
          )}
        >
          Write us
        </h2>
        <p
          className={cn(
            "mt-5 text-lg leading-8 sm:text-xl sm:leading-9",
            isDark ? "text-slate-300" : "text-slate-500"
          )}
        >
          Plans, credits, or a flipbook question — send a short note.
        </p>
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-2 lg:items-start">
        <ContactForm isDark={isDark} />
        <ContactAside isDark={isDark} />
      </div>
    </div>
  );
}
