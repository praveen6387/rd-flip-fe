import Link from "next/link";
import { cn } from "../../cn";
import { LINKS, sectionHref } from "./links";

export default function NavLinks({ pathname, active }) {
  return (
    <nav className="hidden items-center gap-1 md:flex">
      {LINKS.map((link) => {
        const isActive = pathname === "/" && active === link.href;
        return (
          <Link
            key={link.href}
            href={sectionHref(pathname, link.href)}
            className={cn(
              "relative rounded-md px-3 py-2 text-base transition-colors",
              isActive ? "font-medium text-slate-900" : "text-slate-500 hover:text-slate-900",
            )}
          >
            {link.label}
            {isActive ? (
              <span className="absolute inset-x-3 -bottom-[13px] h-0.5 rounded-full bg-linear-to-r from-indigo-500 to-sky-500" />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
