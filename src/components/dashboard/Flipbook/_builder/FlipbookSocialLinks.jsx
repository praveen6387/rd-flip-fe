"use client";

import { cn } from "@/lib/cn";

function FacebookIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M14 8h3V4h-3c-2.8 0-5 2.2-5 5v2H6v4h3v9h4v-9h3.2L17 11h-4V9c0-.6.4-1 1-1Z" />
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

function WhatsAppIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12.04 2c-5.46 0-9.91 4.43-9.91 9.88 0 1.74.46 3.44 1.34 4.94L2 22l5.35-1.4a9.9 9.9 0 0 0 4.69 1.19h.01c5.45 0 9.88-4.43 9.88-9.88C21.93 6.44 17.49 2 12.04 2Zm5.76 14.01c-.24.68-1.4 1.25-1.94 1.33-.5.07-1.13.1-1.82-.11-.42-.13-.96-.31-1.65-.61-2.9-1.25-4.79-4.17-4.93-4.36-.14-.2-1.16-1.54-1.16-2.94 0-1.4.73-2.08 1-2.36.26-.28.57-.35.76-.35h.55c.17 0 .4-.07.63.48.24.57.81 1.98.88 2.12.07.14.12.31.02.5-.1.2-.14.31-.28.48-.14.17-.29.37-.42.5-.14.14-.28.29-.12.56.16.28.7 1.15 1.5 1.86 1.03.92 1.9 1.2 2.17 1.34.27.14.43.12.59-.07.16-.2.68-.79.86-1.06.18-.27.36-.22.6-.13.24.09 1.53.72 1.79.85.26.13.43.2.5.31.06.11.06.64-.18 1.32Z" />
    </svg>
  );
}

function normalizeHref(platform, value) {
  const raw = String(value || "").trim();
  if (!raw) return null;

  if (platform === "whatsapp") {
    const digits = raw.replace(/\D/g, "");
    return digits ? `https://wa.me/${digits}` : null;
  }

  if (/^https?:\/\//i.test(raw)) return raw;
  return `https://${raw}`;
}

const LINKS = [
  {
    key: "whatsapp_number",
    platform: "whatsapp",
    label: "WhatsApp",
    Icon: WhatsAppIcon,
    hover: "hover:border-emerald-400/50 hover:text-emerald-600",
  },
  {
    key: "instagram_url",
    platform: "instagram",
    label: "Instagram",
    Icon: InstagramIcon,
    hover: "hover:border-fuchsia-400/50 hover:text-fuchsia-600",
  },
  {
    key: "facebook_url",
    platform: "facebook",
    label: "Facebook",
    Icon: FacebookIcon,
    hover: "hover:border-sky-400/50 hover:text-sky-600",
  },
];

export default function FlipbookSocialLinks({ flipbook, isDark }) {
  const items = LINKS.map((item) => {
    const href = normalizeHref(item.platform, flipbook?.[item.key]);
    return href ? { ...item, href } : null;
  }).filter(Boolean);

  if (!items.length) {
    return <span className={isDark ? "text-slate-500" : "text-slate-400"}>—</span>;
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {items.map(({ key, href, label, Icon, hover }) => (
        <a
          key={key}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          title={label}
          className={cn(
            "grid size-7 cursor-pointer place-items-center rounded-full border transition",
            isDark
              ? "border-white/15 bg-white/[0.06] text-slate-200"
              : "border-stone-300 bg-white text-slate-600",
            hover
          )}
        >
          <Icon className="size-3.5" />
        </a>
      ))}
    </div>
  );
}
