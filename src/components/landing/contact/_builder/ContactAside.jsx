import { Mail, MapPin, Phone } from "lucide-react";

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

const CONTACTS = [
  {
    icon: Mail,
    label: "rdphotography570@gmail.com",
    href: "mailto:rdphotography570@gmail.com",
    tone: "from-teal-400 to-cyan-500",
  },
  {
    icon: Phone,
    label: "+91 9792098570",
    href: "tel:+919792098570",
    tone: "from-sky-400 to-blue-500",
  },
  {
    icon: MapPin,
    label: "Basti, UP, India",
    href: null,
    tone: "from-orange-400 to-amber-500",
  },
];

export default function ContactAside() {
  return (
    <aside className="rounded-3xl border border-white/70 bg-white/45 p-6 shadow-[0_12px_40px_-24px_rgba(79,70,229,0.3)] ring-1 ring-white/40 backdrop-blur-xl sm:p-8">
      <p className="text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
        Quick notes
      </p>
      <ul className="mt-5 space-y-4">
        {NOTES.map((note) => (
          <li key={note.title}>
            <p className="text-base font-semibold text-slate-900">{note.title}</p>
            <p className="mt-1 text-sm leading-6 text-slate-500">{note.body}</p>
          </li>
        ))}
      </ul>
    </aside>
  );
}
