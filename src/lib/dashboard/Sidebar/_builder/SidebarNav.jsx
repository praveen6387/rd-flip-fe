"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Lock } from "lucide-react";
import { useAuth } from "@/components/auth";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/cn";
import { getDashboardNavItems, isDashboardNavActive } from "./nav-items";

export default function SidebarNav({ onNavigate, collapsed = false }) {
  const pathname = usePathname();
  const { user, verified } = useAuth();
  const items = getDashboardNavItems(user, { verified });

  return (
    <nav
      className="flex flex-1 flex-col gap-1.5 overflow-y-auto px-2.5 py-5"
    >
      {items.map((item, index) => {
        const Icon = item.icon;
        const locked = Boolean(item.locked);
        const active = !locked && isDashboardNavActive(pathname, item.href);
        const rowClass = cn(
          "dash-nav-item group relative flex w-full items-center overflow-hidden rounded-2xl px-3 py-3 text-sm font-medium whitespace-nowrap transition-colors duration-300",
          locked
            ? "cursor-not-allowed text-stone-500"
            : active
              ? "bg-white/15 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] ring-1 ring-white/20"
              : "text-stone-300 hover:bg-white/10 hover:text-white",
          !collapsed && !active && !locked && "hover:translate-x-0.5"
        );
        const rowBody = (
          <>
            {active && !collapsed ? (
              <span className="absolute inset-y-2 left-1 w-1 rounded-full bg-linear-to-b from-sky-400 to-rose-400" />
            ) : null}
            <span
              className={cn(
                "grid size-9 shrink-0 place-items-center rounded-xl transition duration-300",
                active
                  ? "bg-linear-to-br from-sky-500/40 to-rose-500/35 text-white shadow-inner"
                  : locked
                    ? "bg-white/6 text-stone-500"
                    : "bg-white/8 text-stone-300 group-hover:bg-white/12 group-hover:text-sky-200"
              )}
            >
              <Icon className="size-4" />
            </span>
            <span
              className={cn(
                "overflow-hidden truncate transition-[max-width,opacity,margin] duration-300 ease-in-out",
                collapsed ? "ml-0 max-w-0 opacity-0" : "ml-3 max-w-44 opacity-100"
              )}
            >
              {item.label}
            </span>
            {locked ? (
              <Lock
                className={cn(
                  "size-3.5 shrink-0 text-stone-500 transition-[max-width,opacity,margin] duration-300 ease-in-out",
                  collapsed ? "ml-0 max-w-0 opacity-0" : "ml-auto opacity-100"
                )}
              />
            ) : null}
          </>
        );

        const row = locked ? (
          <div
            role="link"
            aria-disabled="true"
            aria-label={`${item.label}, locked`}
            style={{ animationDelay: `${index * 60}ms` }}
            className={rowClass}
          >
            {rowBody}
          </div>
        ) : (
          <Link
            href={item.href}
            prefetch={false}
            onClick={onNavigate}
            style={{ animationDelay: `${index * 60}ms` }}
            aria-label={collapsed ? item.label : undefined}
            className={rowClass}
          >
            {rowBody}
          </Link>
        );

        const key = item.href ?? item.id;

        if (!collapsed) {
          return <div key={key}>{row}</div>;
        }

        return (
          <Tooltip key={key}>
            <TooltipTrigger asChild>{row}</TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              {locked ? `${item.label} · Locked` : item.label}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </nav>
  );
}
