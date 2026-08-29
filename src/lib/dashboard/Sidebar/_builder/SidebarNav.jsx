"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { DASHBOARD_NAV_ITEMS, isDashboardNavActive } from "./nav-items";

export default function SidebarNav({ onNavigate }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-1 flex-col gap-1.5 overflow-y-auto px-3 py-5">
      {DASHBOARD_NAV_ITEMS.map((item, index) => {
        const Icon = item.icon;
        const active = isDashboardNavActive(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            style={{ animationDelay: `${index * 60}ms` }}
            className={cn(
              "dash-nav-item group relative flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-medium transition-all duration-300",
              active
                ? "bg-white/15 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] ring-1 ring-white/20"
                : "text-stone-300 hover:translate-x-0.5 hover:bg-white/10 hover:text-white"
            )}
          >
            {active ? (
              <span className="absolute inset-y-2 left-1 w-1 rounded-full bg-linear-to-b from-sky-400 to-rose-400" />
            ) : null}
            <span
              className={cn(
                "grid size-9 place-items-center rounded-xl transition duration-300",
                active
                  ? "bg-linear-to-br from-sky-500/40 to-rose-500/35 text-white shadow-inner"
                  : "bg-white/8 text-stone-300 group-hover:bg-white/12 group-hover:text-sky-200"
              )}
            >
              <Icon className="size-4" />
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
