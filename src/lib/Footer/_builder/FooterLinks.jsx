import Link from "next/link";
import { LINKS, sectionHref } from "../../TopHeader/_builder/links";

export default function FooterLinks({ pathname }) {
  return (
    <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-base">
      {LINKS.map((link) => (
        <Link
          key={link.href}
          href={sectionHref(pathname, link.href)}
          className="text-white/55 transition-colors hover:text-white"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
