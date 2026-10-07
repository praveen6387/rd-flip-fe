"use client";

import { useState } from "react";
import { Link2, Pencil, Phone, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth";
import { updateSocialLinks } from "@/lib/api/client/auth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

const PLATFORMS = [
  {
    key: "whatsapp_number",
    label: "WhatsApp",
    icon: Phone,
    accent: "from-emerald-400 to-green-600 shadow-emerald-500/30",
    ring: "ring-emerald-400/25",
    glow: "bg-emerald-400/15",
    placeholder: "+919876543210",
    inputType: "tel",
    href: (value) => {
      const digits = String(value).replace(/\D/g, "");
      return digits ? `https://wa.me/${digits}` : null;
    },
    display: (value) => value,
  },
  {
    key: "instagram_url",
    label: "Instagram",
    icon: InstagramIcon,
    accent: "from-fuchsia-500 via-rose-500 to-amber-400 shadow-fuchsia-500/30",
    ring: "ring-fuchsia-400/25",
    glow: "bg-fuchsia-400/15",
    placeholder: "https://instagram.com/studio",
    inputType: "url",
    href: (value) => value || null,
    display: (value) => value,
  },
  {
    key: "facebook_url",
    label: "Facebook",
    icon: FacebookIcon,
    accent: "from-blue-500 to-indigo-600 shadow-blue-500/30",
    ring: "ring-blue-400/25",
    glow: "bg-blue-400/15",
    placeholder: "https://facebook.com/studio",
    inputType: "url",
    href: (value) => value || null,
    display: (value) => value,
  },
];

function SocialCard({ platform, value, isDark, onConnect }) {
  const Icon = platform.icon;
  const href = platform.href(value);
  const hasValue = Boolean(value);

  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-3 rounded-2xl border px-4 py-4 backdrop-blur-xl",
        isDark
          ? "border-white/10 bg-white/8"
          : "border-white/50 bg-white/30"
      )}
    >
      <span
        className={cn(
          "grid size-11 shrink-0 place-items-center rounded-xl bg-linear-to-br text-white shadow-md",
          platform.accent
        )}
      >
        <Icon className="size-4.5" />
      </span>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-xs",
            isDark ? "text-slate-400" : "text-slate-500"
          )}
        >
          {platform.label}
        </p>

        {hasValue && href ? (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className={cn(
              "mt-0.5 block truncate text-sm font-semibold underline-offset-4 transition hover:underline",
              isDark ? "text-white" : "text-slate-900"
            )}
          >
            {platform.display(value)}
          </a>
        ) : (
          <p
            className={cn(
              "mt-0.5 text-sm",
              isDark ? "text-slate-500" : "text-slate-400"
            )}
          >
            Not connected
          </p>
        )}

        {hasValue ? (
          <span
            className={cn(
              "mt-2 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold",
              isDark
                ? "bg-emerald-400/15 text-emerald-200"
                : "bg-emerald-50/80 text-emerald-600"
            )}
          >
            Connected
          </span>
        ) : null}
      </div>

      {hasValue ? null : (
        <button
          type="button"
          onClick={onConnect}
          className={cn(
            "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold",
            isDark
              ? "border border-white/15 bg-white/10 text-slate-100"
              : "border border-slate-200 bg-white text-slate-700"
          )}
        >
          Connect
        </button>
      )}
    </div>
  );
}

function SocialField({ platform, value, onChange, isDark }) {
  const Icon = platform.icon;

  return (
    <div
      className={cn(
        "rounded-2xl border p-4 ring-1 transition focus-within:ring-2",
        isDark
          ? "border-white/12 bg-white/6 ring-white/10 focus-within:border-white/25 focus-within:ring-sky-400/30"
          : "border-stone-200/80 bg-stone-50/80 ring-stone-100 focus-within:border-sky-300 focus-within:ring-sky-200/80"
      )}
    >
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-xl bg-linear-to-br text-white shadow-md",
            platform.accent
          )}
        >
          <Icon className="size-4" />
        </span>
        <div className="min-w-0 flex-1 space-y-1.5">
          <Label
            htmlFor={platform.key}
            className={cn(
              "text-xs font-semibold tracking-wide",
              isDark ? "text-slate-200" : "text-slate-700"
            )}
          >
            {platform.label}
          </Label>
          <Input
            id={platform.key}
            name={platform.key}
            type={platform.inputType}
            placeholder={platform.placeholder}
            value={value}
            onChange={(event) => onChange(platform.key, event.target.value)}
            className={cn(
              "h-10 rounded-xl border-0 bg-transparent px-0 shadow-none focus-visible:ring-0",
              isDark
                ? "text-white placeholder:text-slate-500"
                : "text-slate-900 placeholder:text-slate-400"
            )}
          />
        </div>
      </div>
    </div>
  );
}

export default function SocialLinks({ user, isDark }) {
  const { applyUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    whatsapp_number: user.whatsapp_number || "",
    instagram_url: user.instagram_url || "",
    facebook_url: user.facebook_url || "",
  });

  const connectedCount = PLATFORMS.filter(
    (platform) => user[platform.key]
  ).length;

  function openEditor() {
    setForm({
      whatsapp_number: user.whatsapp_number || "",
      instagram_url: user.instagram_url || "",
      facebook_url: user.facebook_url || "",
    });
    setOpen(true);
  }

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSave(event) {
    event.preventDefault();
    setIsSaving(true);

    try {
      const result = await updateSocialLinks({
        whatsapp_number: form.whatsapp_number.trim(),
        instagram_url: form.instagram_url.trim(),
        facebook_url: form.facebook_url.trim(),
      });
      if (result.data?.user) applyUser(result.data.user);
      toast.success("Social links updated");
      setOpen(false);
    } catch (error) {
      toast.error(error.message || "Failed to update social links");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section
      className={cn(
        "space-y-4 rounded-[1.6rem] border p-4 backdrop-blur-xl sm:p-5",
        isDark
          ? "border-white/10 bg-white/8"
          : "border-white/50 bg-white/25 shadow-[0_8px_32px_-24px_rgba(80,90,140,0.4)]"
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "grid size-9 shrink-0 place-items-center rounded-full",
              isDark ? "bg-sky-400/15 text-sky-200" : "bg-sky-100/80 text-sky-600"
            )}
          >
            <Link2 className="size-4" />
          </span>
          <div>
            <h3
              className={cn(
                "text-base font-semibold tracking-tight",
                isDark ? "text-white" : "text-slate-900"
              )}
            >
              Social Links
            </h3>
            <p
              className={cn(
                "text-sm",
                isDark ? "text-slate-400" : "text-slate-500"
              )}
            >
              {connectedCount} of {PLATFORMS.length} connected — shown on your
              flipbooks.
            </p>
          </div>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={openEditor}
          className={cn(
            "h-9 shrink-0 gap-1.5 rounded-full px-3.5 text-sm shadow-none",
            isDark
              ? "bg-sky-400/15 text-sky-100 hover:bg-sky-400/25"
              : "bg-sky-50 text-sky-700 hover:bg-sky-100"
          )}
        >
          <Pencil className="size-3.5" />
          Update Links
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {PLATFORMS.map((platform) => (
          <SocialCard
            key={platform.key}
            platform={platform}
            value={user[platform.key]}
            isDark={isDark}
            onConnect={openEditor}
          />
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          className={cn(
            "gap-0 overflow-hidden rounded-3xl border-0 p-0 shadow-2xl sm:max-w-lg",
            isDark ? "bg-slate-900 text-white" : "bg-white"
          )}
        >
          <div
            className={cn(
              "relative border-b px-6 pb-5 pt-6",
              isDark
                ? "border-white/10 bg-linear-to-br from-sky-500/15 via-transparent to-fuchsia-500/10"
                : "border-stone-100 bg-linear-to-br from-sky-50 via-white to-rose-50"
            )}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              className={cn(
                "absolute right-4 top-4 grid size-8 place-items-center rounded-full transition",
                isDark
                  ? "bg-white/10 text-slate-300 hover:bg-white/15 hover:text-white"
                  : "bg-stone-100 text-slate-500 hover:bg-stone-200 hover:text-slate-800"
              )}
              aria-label="Close"
            >
              <X className="size-4" />
            </button>

            <div className="flex items-center gap-3 pr-10">
              <span className="grid size-11 place-items-center rounded-2xl bg-linear-to-br from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/25">
                <Sparkles className="size-5" />
              </span>
              <div>
                <DialogTitle
                  className={cn(
                    "font-serif text-xl tracking-tight",
                    isDark ? "text-white" : "text-slate-900"
                  )}
                >
                  Update social links
                </DialogTitle>
                <DialogDescription
                  className={cn(
                    "mt-1 text-sm",
                    isDark ? "text-slate-400" : "text-slate-600"
                  )}
                >
                  These links can appear on your flipbooks. Leave a field empty
                  to remove it.
                </DialogDescription>
              </div>
            </div>
          </div>

          <form onSubmit={handleSave} className="grid gap-5 px-6 py-5">
            <div className="grid gap-3">
              {PLATFORMS.map((platform) => (
                <SocialField
                  key={platform.key}
                  platform={platform}
                  value={form[platform.key]}
                  onChange={updateField}
                  isDark={isDark}
                />
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-full px-5",
                  isDark
                    ? "border-white/15 bg-white/5 text-white hover:bg-white/10"
                    : "border-stone-200 bg-white text-slate-700"
                )}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="rounded-full bg-linear-to-r from-sky-600 to-indigo-600 px-5 text-white shadow-md hover:from-sky-500 hover:to-indigo-500"
              >
                {isSaving ? "Saving…" : "Save links"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
