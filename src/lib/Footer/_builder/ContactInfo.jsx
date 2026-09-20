import { Mail, MapPin, Phone } from "lucide-react";
import { CONTACT } from "./data";

export default function ContactInfo() {
  return (
    <div>
      <h3 className="text-base font-semibold text-white">Contact</h3>
      <ul className="mt-5 space-y-4">
        <li>
          <a
            href={`mailto:${CONTACT.email}`}
            className="group flex items-center gap-3"
          >
            <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-teal-400 to-cyan-500 text-white">
              <Mail className="size-4" strokeWidth={2.25} />
            </span>
            <span className="text-sm text-white/60 transition group-hover:text-white">
              {CONTACT.email}
            </span>
          </a>
        </li>

        <li>
          <a href={CONTACT.phoneHref} className="group flex items-center gap-3">
            <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-sky-400 to-blue-500 text-white">
              <Phone className="size-4" strokeWidth={2.25} />
            </span>
            <span className="text-sm text-white/60 transition group-hover:text-white">
              {CONTACT.phone}
            </span>
          </a>
        </li>

        {CONTACT.addresses.map((address) => (
          <li key={address.location}>
            <div className="flex items-start gap-3">
              <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-orange-400 to-amber-500 text-white">
                <MapPin className="size-4" strokeWidth={2.25} />
              </span>
              <div className="min-w-0 pt-0.5">
                <p className="text-[11px] font-medium tracking-[0.14em] text-white/45 uppercase">
                  {address.label}
                </p>
                <p className="mt-0.5 text-sm text-white/60">{address.location}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
