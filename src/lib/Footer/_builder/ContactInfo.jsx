import { Mail, MapPin, Phone } from "lucide-react";
import { CONTACT } from "./data";

const ROWS = [
  {
    icon: Mail,
    label: CONTACT.email,
    href: `mailto:${CONTACT.email}`,
    tone: "from-teal-400 to-cyan-500",
  },
  {
    icon: Phone,
    label: CONTACT.phone,
    href: CONTACT.phoneHref,
    tone: "from-sky-400 to-blue-500",
  },
  {
    icon: MapPin,
    label: CONTACT.location,
    href: null,
    tone: "from-orange-400 to-amber-500",
  },
];

export default function ContactInfo() {
  return (
    <div>
      <h3 className="text-base font-semibold text-white">Contact</h3>
      <ul className="mt-5 space-y-4">
        {ROWS.map((row) => {
          const Icon = row.icon;
          const content = (
            <>
              <span
                className={`inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br ${row.tone} text-white`}
              >
                <Icon className="size-4" strokeWidth={2.25} />
              </span>
              <span className="text-sm text-white/60 transition group-hover:text-white">
                {row.label}
              </span>
            </>
          );

          return (
            <li key={row.label}>
              {row.href ? (
                <a href={row.href} className="group flex items-center gap-3">
                  {content}
                </a>
              ) : (
                <div className="flex items-center gap-3">{content}</div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
