"use client";

import { useState } from "react";
import { Check, Link2, Share2 } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function WhatsAppIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12.04 2c-5.46 0-9.91 4.43-9.91 9.88 0 1.74.46 3.44 1.34 4.94L2 22l5.35-1.4a9.9 9.9 0 0 0 4.69 1.19h.01c5.45 0 9.88-4.43 9.88-9.88C21.93 6.44 17.49 2 12.04 2Zm5.76 14.01c-.24.68-1.4 1.25-1.94 1.33-.5.07-1.13.1-1.82-.11-.42-.13-.96-.31-1.65-.61-2.9-1.25-4.79-4.17-4.93-4.36-.14-.2-1.16-1.54-1.16-2.94 0-1.4.73-2.08 1-2.36.26-.28.57-.35.76-.35h.55c.17 0 .4-.07.63.48.24.57.81 1.98.88 2.12.07.14.12.31.02.5-.1.2-.14.31-.28.48-.14.17-.29.37-.42.5-.14.14-.28.29-.12.56.16.28.7 1.15 1.5 1.86 1.03.92 1.9 1.2 2.17 1.34.27.14.43.12.59-.07.16-.2.68-.79.86-1.06.18-.27.36-.22.6-.13.24.09 1.53.72 1.79.85.26.13.43.2.5.31.06.11.06.64-.18 1.32Z" />
    </svg>
  );
}

function InstagramIcon({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
      aria-hidden
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M14 8h3V4h-3c-2.8 0-5 2.2-5 5v2H6v4h3v9h4v-9h3.2L17 11h-4V9c0-.6.4-1 1-1Z" />
    </svg>
  );
}

function getShareUrl() {
  if (typeof window === "undefined") return "";
  return window.location.href;
}

function getShareText(title) {
  const url = getShareUrl();
  const label = String(title || "").trim();
  return label ? `${label}\n${url}` : url;
}

export default function ViewerShareMenu({ title }) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    const url = getShareUrl();
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied");
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Could not copy link");
    }
  }

  function shareWhatsApp() {
    const text = getShareText(title);
    if (!text) return;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  async function shareInstagram() {
    const url = getShareUrl();
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied — paste it in Instagram");
    } catch {
      toast.error("Could not copy link");
      return;
    }
    window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
  }

  function shareFacebook() {
    const url = getShareUrl();
    if (!url) return;
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Share flipbook"
          className="grid size-9 place-items-center rounded-full border border-amber-200/25 bg-black/30 text-amber-200/85 transition hover:bg-white/10 hover:text-amber-200"
        >
          <Share2 className="size-4 text-amber-200/85" strokeWidth={1.75} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="min-w-44 rounded-2xl border border-white/12 bg-[#141414]/95 p-1.5 text-amber-50 shadow-xl backdrop-blur-xl"
      >
        <DropdownMenuItem
          className="cursor-pointer gap-2.5 rounded-xl px-2.5 py-2 text-sm focus:bg-white/10 focus:text-amber-50"
          onClick={copyLink}
        >
          {copied ? (
            <Check className="size-4 text-emerald-300" />
          ) : (
            <Link2 className="size-4 opacity-80" />
          )}
          Copy link
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer gap-2.5 rounded-xl px-2.5 py-2 text-sm focus:bg-white/10 focus:text-amber-50"
          onClick={shareWhatsApp}
        >
          <WhatsAppIcon className="size-4 text-emerald-300" />
          WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer gap-2.5 rounded-xl px-2.5 py-2 text-sm focus:bg-white/10 focus:text-amber-50"
          onClick={shareInstagram}
        >
          <InstagramIcon className="size-4 text-fuchsia-300" />
          Instagram
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer gap-2.5 rounded-xl px-2.5 py-2 text-sm focus:bg-white/10 focus:text-amber-50"
          onClick={shareFacebook}
        >
          <FacebookIcon className="size-4 text-sky-300" />
          Facebook
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
