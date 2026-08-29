"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import SidebarBrand from "./_builder/SidebarBrand";
import SidebarNav from "./_builder/SidebarNav";
import SidebarTwinkles from "./_builder/SidebarTwinkles";

export default function MobileSidebar({ open, onOpenChange }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        showCloseButton
        className="w-[min(100%,18rem)] gap-0 overflow-hidden border-white/15 bg-[#1a1614] p-0 text-white backdrop-blur-2xl md:hidden [&_[data-slot=sheet-close]]:text-stone-300"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Dashboard menu</SheetTitle>
        </SheetHeader>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(160deg,rgba(255,255,255,0.12)_0%,transparent_40%)]"
        />
        <SidebarTwinkles />
        <div className="relative z-10 flex h-full flex-col">
          <SidebarBrand compactCloseSpace />
          <SidebarNav onNavigate={() => onOpenChange(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
