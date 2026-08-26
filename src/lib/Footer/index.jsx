"use client";

import { usePathname } from "next/navigation";
import Brand from "./_builder/Brand";
import ContactInfo from "./_builder/ContactInfo";
import Copyright from "./_builder/Copyright";
import FooterLinks from "./_builder/FooterLinks";
import SocialLinks from "./_builder/SocialLinks";

export default function Footer() {
  const pathname = usePathname();

  return (
    <footer className="relative mt-auto overflow-hidden bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 font-sans text-white">
      <div className="pointer-events-none absolute top-0 right-0 h-56 w-56 rounded-full bg-violet-500/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl" />

      <div className="relative mx-auto grid w-full max-w-6xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">
        <div>
          <Brand pathname={pathname} />
          <p className="mt-4 max-w-sm text-sm leading-7 text-white/55">
            Capturing life&apos;s beautiful moments through the lens. Professional
            photography services for all your special occasions with passion and
            creativity.
          </p>
          <SocialLinks />
        </div>

        <FooterLinks pathname={pathname} />
        <ContactInfo />
      </div>

      <div className="relative border-t border-white/10">
        <div className="mx-auto flex w-full max-w-6xl px-6 py-5">
          <Copyright />
        </div>
      </div>
    </footer>
  );
}
