import ContactForm from "./ContactForm";
import ContactAside from "./ContactAside";

export default function Content() {
  return (
    <div>
      <div className="max-w-xl">
        <p className="text-sm font-medium uppercase tracking-[0.22em] text-indigo-600 sm:text-base">
          Contact
        </p>
        <h2 className="mt-3 font-heading text-3xl leading-tight text-slate-900 sm:text-4xl">
          Write us
        </h2>
        <p className="mt-3 text-base text-slate-500 sm:text-lg">
          Plans, credits, or a flipbook question — send a short note.
        </p>
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-2 lg:items-start">
        <ContactForm />
        <ContactAside />
      </div>
    </div>
  );
}
