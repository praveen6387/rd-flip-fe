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
              "relative rounded-md px-3 py-2 text-sm transition-colors",
              isActive ? "font-medium text-white" : "text-white/55 hover:text-white",
            )}
          >
            {link.label}
            {isActive ? (
              <span className="absolute inset-x-3 -bottom-[13px] h-px rounded-full bg-[#d4af37]" />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
