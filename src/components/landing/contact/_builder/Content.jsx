import ContactForm from "./ContactForm";
import ContactAside from "./ContactAside";

export default function Content() {
  return (
    <div>
      <p className="font-heading text-5xl leading-tight text-slate-900 sm:text-6xl">
        Write us.
        <span className="mt-3 block text-2xl font-sans font-normal text-slate-500 sm:text-3xl">
          desk@rdflip.in
        </span>
      </p>
      <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600 sm:text-xl sm:leading-9">
        Studio vs Lab, credits, or a book that should already be in the library.
        Form on the left — notes on the right.
      </p>
      <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:items-start">
        <ContactForm />
        <ContactAside />
      </div>
    </div>
  );
}
