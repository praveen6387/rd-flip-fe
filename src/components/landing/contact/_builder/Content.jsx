import ContactForm from "./ContactForm";
import ContactAside from "./ContactAside";

export default function Content() {
  return (
    <div>
      <p className="font-heading text-4xl leading-tight text-white sm:text-5xl">
        Write us.
        <span className="mt-2 block text-xl font-sans font-normal text-white/45">
          desk@rdflip.in
        </span>
      </p>
      <p className="mt-4 max-w-md text-sm text-white/50">
        Studio vs Lab, credits, or a book that should already be in the library.
        Form on the left — notes on the right.
      </p>
      <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:items-start">
        <ContactForm />
        <ContactAside />
      </div>
    </div>
  );
}
