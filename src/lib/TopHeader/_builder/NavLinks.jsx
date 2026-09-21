import Link from "next/link";
import { cn } from "../../cn";
import { LINKS, sectionHref } from "./links";

export default function NavLinks({ pathname, active, light = false }) {
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
              light
                ? isActive
                  ? "font-medium text-white"
                  : "text-white/60 hover:text-white"
                : isActive
                  ? "font-medium text-[#5a324c]"
                  : "text-slate-500 hover:text-[#5a324c]"
            )}
          >
            {link.label}
            {isActive ? (
              <span
                className={cn(
                  "absolute inset-x-3 -bottom-[13px] h-0.5 rounded-full bg-linear-to-r",
                  light
                    ? "from-[#c48a9e] to-[#e8c4d0]"
                    : "from-[#6d3d5c] to-[#8f5678]"
                )}
              />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
