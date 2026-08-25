import Link from "next/link";
import { cn } from "../../cn";
import { LINKS, sectionHref } from "./links";

export default function MobileNav({ pathname, active }) {
  return (
    <nav className="flex items-center gap-1 overflow-x-auto border-t border-white/10 px-4 py-2 md:hidden">
      {LINKS.map((link) => {
        const isActive = pathname === "/" && active === link.href;
        return (
          <Link
            key={link.href}
            href={sectionHref(pathname, link.href)}
            className={cn(
              "whitespace-nowrap rounded-full px-3 py-1.5 text-sm",
              isActive ? "bg-[#d4af37] text-black" : "text-white/60",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
