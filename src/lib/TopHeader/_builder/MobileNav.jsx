"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import GoogleTranslate from "@/components/GoogleTranslate";
import { cn } from "../../cn";
import LandingThemeToggle from "./LandingThemeToggle";
import { LINKS, sectionHref } from "./links";

export default function MobileNav({
  pathname,
  active,
  solid = true,
  light = false,
  darkSolid = false,
}) {
  const [open, setOpen] = useState(false);
  const border = solid
    ? darkSolid
      ? "border-white/10"
      : "border-slate-200"
    : light
      ? "border-white/10"
      : "border-transparent";
  const idle = light ? "text-white/80" : "text-slate-600";
  const panel = solid
    ? darkSolid
      ? "bg-[#0b1017]/95"
      : "bg-white/95"
    : light
      ? "bg-[#12101a]/88"
      : "bg-white/92";

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-full border transition",
          light
            ? "border-white/25 bg-white/10 text-white"
            : "border-slate-200/80 bg-white/70 text-slate-700"
        )}
      >
        {open ? <X className="size-4" /> : <Menu className="size-4" />}
      </button>
      {open ? (
        <div className={cn("absolute inset-x-0 top-full z-50 border-b px-3 py-3 shadow-lg backdrop-blur-md", border, panel)}>
          <div className="mb-3 flex items-center gap-2">
            <LandingThemeToggle light={light} />
            <GoogleTranslate appearance={light ? "dark" : "light"} />
          </div>
          <nav className="grid grid-cols-2 gap-2">
            {LINKS.map((link) => {
              const isActive = pathname === "/" && active === link.href;
              return (
                <Link
                  key={link.href}
                  href={sectionHref(pathname, link.href)}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "rounded-xl px-3 py-2.5 text-center text-sm font-medium",
                    isActive
                      ? "bg-linear-to-r from-[#8f5678] to-[#c48a9e] text-white"
                      : cn(idle, light ? "bg-white/8" : "bg-slate-100/80")
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      ) : null}
    </div>
  );
}
