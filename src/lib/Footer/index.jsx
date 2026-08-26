"use client";

import { usePathname } from "next/navigation";
import Brand from "./_builder/Brand";
import Copyright from "./_builder/Copyright";
import FooterLinks from "./_builder/FooterLinks";

export default function Footer() {
  const pathname = usePathname();

  return (
    <footer className="relative mt-auto overflow-hidden bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 font-sans text-white">
      <div className="pointer-events-none absolute top-10 right-10 h-32 w-32 rounded-full bg-linear-to-br from-indigo-500/10 to-purple-500/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 left-10 h-40 w-40 rounded-full bg-linear-to-br from-rose-500/10 to-pink-500/10 blur-3xl" />
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-4">
          <Brand pathname={pathname} />
          <p className="max-w-sm text-base leading-7 text-white/60">
            Sign up, make the book, share a link or QR. Search by client, date, or studio.
          </p>
        </div>
        <FooterLinks pathname={pathname} />
      </div>
      <div className="relative border-t border-white/10">
        <div className="mx-auto flex w-full max-w-6xl px-6 py-4">
          <Copyright />
        </div>
      </div>
    </footer>
  );
}
