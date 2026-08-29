"use client";

import { usePathname } from "next/navigation";
import AuthButtons from "./_builder/AuthButtons";
import Logo from "./_builder/Logo";
import MobileNav from "./_builder/MobileNav";
import NavLinks from "./_builder/NavLinks";
import { useActiveSection } from "./_builder/useActiveSection";

export default function TopHeader() {
  const pathname = usePathname();
  const active = useActiveSection();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/75 font-sans backdrop-blur-md">
      <div className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between gap-6 px-4">
        <Logo pathname={pathname} />
        <NavLinks pathname={pathname} active={active} />
        <AuthButtons />
      </div>
      <MobileNav pathname={pathname} active={active} />
    </header>
  );
}
