"use client";

import { usePathname } from "next/navigation";
import Brand from "./_builder/Brand";
import Copyright from "./_builder/Copyright";
import FooterLinks from "./_builder/FooterLinks";

export default function Footer() {
  const pathname = usePathname();

  return (
    <footer className="mt-auto border-t border-[#d4af37]/20 bg-[#0a0a0a]/80 font-sans">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-4">
          <Brand pathname={pathname} />
          <p className="max-w-sm text-sm leading-6 text-white/60">
            Sign up, make the book, share a link or QR. Search by client, date, or studio.
          </p>
        </div>
        <FooterLinks pathname={pathname} />
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-6xl px-6 py-4">
          <Copyright />
        </div>
      </div>
    </footer>
  );
}
