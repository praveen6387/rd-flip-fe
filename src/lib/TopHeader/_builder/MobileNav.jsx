import Link from "next/link";
import { cn } from "../../cn";
import { LINKS, sectionHref } from "./links";

export default function MobileNav({ pathname, active }) {
  return (
    <nav className="flex items-center gap-1 overflow-x-auto border-t border-slate-200 px-4 py-2 md:hidden">
      {LINKS.map((link) => {
        const isActive = pathname === "/" && active === link.href;
        return (
          <Link
            key={link.href}
            href={sectionHref(pathname, link.href)}
            className={cn(
              "whitespace-nowrap rounded-full px-3.5 py-2 text-base",
              isActive
                ? "bg-linear-to-r from-indigo-500 to-sky-600 text-white"
                : "text-slate-500",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
