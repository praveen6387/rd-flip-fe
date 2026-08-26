import Link from "next/link";
import { LINKS, sectionHref } from "../../TopHeader/_builder/links";

export default function FooterLinks({ pathname }) {
  return (
    <div>
      <h3 className="text-base font-semibold text-white">Quick Links</h3>
      <ul className="mt-5 space-y-3">
        {LINKS.map((link) => (
          <li key={link.href}>
            <Link
              href={sectionHref(pathname, link.href)}
              className="group inline-flex items-center gap-2.5 text-sm text-white/55 transition hover:text-white"
            >
              <span className="size-1.5 rounded-full bg-sky-400 transition group-hover:bg-sky-300" />
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
