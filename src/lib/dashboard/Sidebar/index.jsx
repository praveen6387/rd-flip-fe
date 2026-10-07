"use client";

import { useEffect, useState } from "react";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "@/lib/cn";
import SidebarBrand from "./_builder/SidebarBrand";
import SidebarNav from "./_builder/SidebarNav";
import SidebarTwinkles from "./_builder/SidebarTwinkles";

const STORAGE_KEY = "dashboard_sidebar";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (window.localStorage.getItem(STORAGE_KEY) === "closed") {
      setCollapsed(true);
    }
  }, []);

  function toggleSidebar() {
    setCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem(STORAGE_KEY, next ? "closed" : "open");
      return next;
    });
  }

  return (
    <aside
      className={cn(
        "relative z-30 hidden h-full shrink-0 flex-col overflow-visible border-r border-white/15 bg-[#1a1614] shadow-[8px_0_32px_-12px_rgba(26,22,20,0.45)] backdrop-blur-2xl transition-[width] duration-300 ease-in-out md:flex",
        collapsed ? "w-20" : "w-72"
      )}
    >
      <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(160deg,rgba(255,255,255,0.14)_0%,rgba(255,255,255,0.04)_22%,transparent_45%,rgba(244,239,230,0.06)_100%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-16 left-1/2 z-0 size-56 -translate-x-1/2 rounded-full bg-rose-400/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-10 -left-10 z-0 size-44 rounded-full bg-sky-400/15 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 z-0 h-px bg-linear-to-r from-transparent via-white/40 to-transparent"
        />
        <SidebarTwinkles />
        <SidebarBrand collapsed={collapsed} edgeToggle />
        <SidebarNav collapsed={collapsed} />
        {collapsed ? null : (
          <div className="mt-auto border-t border-white/10 px-4 py-4">
            <p className="text-[11px] font-medium tracking-[0.18em] text-stone-400 uppercase">
              Studio workspace
            </p>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={toggleSidebar}
        aria-label={collapsed ? "Open sidebar" : "Close sidebar"}
        aria-expanded={!collapsed}
        className={cn(
          "absolute top-[2.375rem] z-20 grid size-8 -translate-y-1/2 place-items-center rounded-lg border border-white/15 text-stone-200 transition-[right,transform,background-color] duration-300 ease-in-out hover:text-white",
          collapsed
            ? "right-0 translate-x-1/2 border-white/10 bg-[#3d3531] hover:bg-[#4a413c]"
            : "right-3 translate-x-0 border-white/10 bg-[#3d3531] hover:bg-[#4a413c]"
        )}
      >
        <span className="relative size-4">
          <ChevronsLeft
            className={cn(
              "absolute inset-0 size-4 transition-all duration-300 ease-in-out",
              collapsed ? "scale-75 opacity-0" : "scale-100 opacity-100"
            )}
          />
          <ChevronsRight
            className={cn(
              "absolute inset-0 size-4 transition-all duration-300 ease-in-out",
              collapsed ? "scale-100 opacity-100" : "scale-75 opacity-0"
            )}
          />
        </span>
      </button>
    </aside>
  );
}
