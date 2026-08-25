import Link from "next/link";
import { Button } from "@/components/ui/button";
import SpreadStack from "./SpreadStack";

export default function Content() {
  return (
    <div className="flex flex-col gap-16">
      <div className="flex flex-col gap-12 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-xl">
          <p className="text-[11px] tracking-[0.28em] text-white/40 uppercase">
            Dashboard · covers · share
          </p>
          <h1 className="mt-4 font-heading text-4xl leading-[1.15] text-white sm:text-5xl">
            Build the flipbook.
            <span className="mt-2 block font-sans text-2xl font-normal tracking-tight text-white/70 sm:text-3xl">
              Hand the client a link or a QR.
            </span>
          </h1>
          <p className="mt-5 max-w-md text-sm leading-6 text-white/55">
            Sign up, open the dashboard, add the customer, drop front cover, inside
            pages, and back cover. Rearrange on the same screen. Create. Then
            preview, share, or send a QR. Search later by client, date, or studio.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button
              asChild
              className="h-10 rounded-none px-6 bg-[#d4af37] text-black hover:bg-[#e4c35a]"
            >
              <Link href="#how-it-works">See how you create</Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              className="h-10 rounded-none px-4 text-white/80 underline-offset-4 hover:bg-transparent hover:text-white hover:underline"
            >
              <Link href="#pricing">Studio vs Lab</Link>
            </Button>
          </div>
          <p className="mt-5 text-xs text-white/40">
            New accounts get 1 free flipbook credit for 7 days. Use Signup in the
            header to reach the dashboard.
          </p>
        </div>
        <SpreadStack />
      </div>
      <dl className="grid grid-cols-3 gap-4 border-t border-white/15 pt-6">
        <div>
          <dt className="text-[11px] uppercase tracking-widest text-white/40">Covers</dt>
          <dd className="mt-1 font-heading text-2xl text-white">Front · in · back</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-widest text-white/40">Share</dt>
          <dd className="mt-1 font-heading text-2xl text-white">Link or QR</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-widest text-white/40">Find</dt>
          <dd className="mt-1 font-heading text-2xl text-white">Name · date · studio</dd>
        </div>
      </dl>
    </div>
  );
}
