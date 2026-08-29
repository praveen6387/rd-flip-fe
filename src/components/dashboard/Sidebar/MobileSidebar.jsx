"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import SidebarBrand from "./_builder/SidebarBrand";
import SidebarNav from "./_builder/SidebarNav";

export default function MobileSidebar({ open, onOpenChange }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        showCloseButton
        className="w-[min(100%,18rem)] gap-0 p-0 md:hidden"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Dashboard menu</SheetTitle>
        </SheetHeader>
        <div className="flex h-full flex-col">
          <SidebarBrand />
          <SidebarNav onNavigate={() => onOpenChange(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
