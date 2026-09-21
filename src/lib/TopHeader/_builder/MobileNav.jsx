import Link from "next/link";
import { cn } from "../../cn";
import { LINKS, sectionHref } from "./links";

export default function MobileNav({
  pathname,
  active,
  solid = true,
  light = false,
}) {
  return (
    <nav
      className={cn(
        "flex items-center gap-1 overflow-x-auto px-4 py-2 md:hidden",
        solid
          ? "border-t border-slate-200"
          : light
            ? "border-t border-white/10"
            : "border-t border-transparent"
      )}
    >
      {LINKS.map((link) => {
        const isActive = pathname === "/" && active === link.href;
        return (
          <Link
            key={link.href}
            href={sectionHref(pathname, link.href)}
            className={cn(
              "whitespace-nowrap rounded-full px-3.5 py-2 text-base",
              isActive
                ? "bg-linear-to-r from-[#8f5678] to-[#c48a9e] text-white"
                : light
                  ? "text-white/65"
                  : "text-slate-500"
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
