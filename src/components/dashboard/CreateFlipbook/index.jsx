"use client";

import { useState } from "react";
import { CalendarDays, Phone, Type } from "lucide-react";
import { toast } from "sonner";
import PagePanel from "@/components/dashboard/_builder/PagePanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDashboardTheme } from "@/lib/dashboard/ThemeProvider";
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

function isLabPlan(plan) {
  return String(plan || "").toLowerCase().includes("lab");
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function FieldShell({ label, hint, htmlFor, required, isDark, children }) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <Label
          htmlFor={htmlFor}
          className={cn(
            "text-[11px] font-medium tracking-[0.18em] uppercase",
            isDark ? "text-slate-300" : "text-slate-600"
          )}
        >
          {label}
          {required ? (
            <span className="ml-1 text-rose-500 normal-case tracking-normal">
              *
            </span>
          ) : (
            <span
              className={cn(
                "ml-2 text-[10px] font-normal tracking-[0.12em] uppercase",
                isDark ? "text-slate-500" : "text-slate-400"
              )}
            >
              Optional
            </span>
          )}
        </Label>
        {hint ? (
          <span
            className={cn(
              "text-xs",
              isDark ? "text-slate-500" : "text-slate-400"
            )}
          >
            {hint}
          </span>
        ) : null}
      </div>
      {children}
    </div>
  );
}

function glassInput(isDark) {
  return cn(
    "h-10 rounded-xl border px-3 text-sm shadow-none",
    isDark
      ? "border-white/20 bg-white/[0.06] text-white placeholder:text-slate-500 focus-visible:border-sky-400/50 focus-visible:bg-white/10 focus-visible:ring-sky-400/20"
      : "border-stone-300/60 bg-white/45 text-slate-900 placeholder:text-slate-400 focus-visible:border-sky-400/60 focus-visible:bg-white/70 focus-visible:ring-sky-300/30"
  );
}

export default function CreateFlipbook({ user, error }) {
  const { isDark } = useDashboardTheme();
  const lab = isLabPlan(user?.plan);

  const [form, setForm] = useState({
    title: "",
    description: "",
    date: todayISO(),
    studio_name: user?.studio_name || "",
    whatsapp_number: user?.whatsapp_number || "",
    instagram_url: user?.instagram_url || "",
    facebook_url: user?.facebook_url || "",
  });

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!form.title.trim()) {
      toast.error("Please add a flipbook title.");
      return;
    }

    if (!form.date) {
      toast.error("Please choose a date.");
      return;
    }

    if (lab && !form.studio_name.trim()) {
      toast.error("Studio name is required for lab flipbooks.");
      return;
    }

    toast.success("Details saved. Upload steps will plug in next.");
  }

  if (error || !user) {
    return (
      <PagePanel
        eyebrow="Create"
        title="New flipbook"
        description="We couldn't load your studio plan right now."
      >
        <div
          className={cn(
            "rounded-2xl border px-5 py-8 text-center text-sm",
            isDark
              ? "border-rose-400/30 bg-rose-500/10 text-rose-100"
              : "border-rose-200/80 bg-rose-50/80 text-rose-700"
          )}
        >
          {error || "Profile unavailable"}
        </div>
      </PagePanel>
    );
  }

  return (
    <PagePanel
      eyebrow="Create"
      title="New flipbook"
      description={
        lab
          ? "Add the story details, then the studio ads that appear on this lab flipbook."
          : "Give this flipbook a title and date. Description can wait."
      }
    >
      <form onSubmit={handleSubmit} className="dash-stagger space-y-8">
        <section
          className={cn(
            "space-y-5 rounded-[1.6rem] border p-5 sm:p-6",
            isDark
              ? "border-white/25 bg-white/[0.04]"
              : "border-stone-300/55 bg-white/20"
          )}
        >
          <div>
            <h3
              className={cn(
                "font-heading text-lg tracking-tight",
                isDark ? "text-white" : "text-slate-900"
              )}
            >
              Flipbook
            </h3>
            <p
              className={cn(
                "mt-1 text-sm",
                isDark ? "text-slate-400" : "text-slate-500"
              )}
            >
              The basics clients will see first.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_10.5rem] sm:items-end">
            <FieldShell
              label="Title"
              htmlFor="flipbook-title"
              required
              isDark={isDark}
            >
              <div className="relative">
                <Type
                  className={cn(
                    "pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2",
                    isDark ? "text-slate-500" : "text-slate-400"
                  )}
                />
                <Input
                  id="flipbook-title"
                  name="title"
                  required
                  maxLength={80}
                  placeholder="Riya and Aman"
                  value={form.title}
                  onChange={(event) => update("title", event.target.value)}
                  className={cn(glassInput(isDark), "pl-9")}
                />
              </div>
            </FieldShell>

            <FieldShell
              label="Date"
              htmlFor="flipbook-date"
              required
              isDark={isDark}
            >
              <div className="relative">
                <CalendarDays
                  className={cn(
                    "pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2",
                    isDark ? "text-slate-500" : "text-slate-400"
                  )}
                />
                <Input
                  id="flipbook-date"
                  name="date"
                  type="date"
                  required
                  value={form.date}
                  onChange={(event) => update("date", event.target.value)}
                  className={cn(glassInput(isDark), "w-full pl-9")}
                />
              </div>
            </FieldShell>
          </div>

          <FieldShell
            label="Description"
            htmlFor="flipbook-description"
            isDark={isDark}
            hint={`${form.description.length}/80`}
          >
            <Input
              id="flipbook-description"
              name="description"
              maxLength={80}
              placeholder="Short note about this album"
              value={form.description}
              onChange={(event) => update("description", event.target.value)}
              className={glassInput(isDark)}
            />
          </FieldShell>
        </section>

        {lab ? (
          <section
            className={cn(
              "space-y-5 rounded-[1.6rem] border p-5 sm:p-6",
              isDark
                ? "border-white/25 bg-white/[0.04]"
                : "border-stone-300/55 bg-white/20"
            )}
          >
            <div>
              <p
                className={cn(
                  "text-[11px] font-medium tracking-[0.22em] uppercase",
                  isDark ? "text-sky-300" : "text-sky-800/80"
                )}
              >
                Lab plan
              </p>
              <h3
                className={cn(
                  "font-heading mt-1 text-lg tracking-tight",
                  isDark ? "text-white" : "text-slate-900"
                )}
              >
                Studio advertise
              </h3>
              <p
                className={cn(
                  "mt-1 max-w-xl text-sm",
                  isDark ? "text-slate-400" : "text-slate-500"
                )}
              >
                These details can appear on this flipbook. Prefills come from
                your profile — edit them if this album should look different.
              </p>
            </div>

            <FieldShell
              label="Studio name"
              htmlFor="studio_name"
              required
              isDark={isDark}
            >
              <Input
                id="studio_name"
                name="studio_name"
                required
                placeholder="Praveen Studio"
                value={form.studio_name}
                onChange={(event) => update("studio_name", event.target.value)}
                className={glassInput(isDark)}
              />
            </FieldShell>

            <div className="grid gap-5 sm:grid-cols-2">
              <FieldShell
                label="WhatsApp number"
                htmlFor="whatsapp_number"
                isDark={isDark}
              >
                <div className="relative">
                  <Phone
                    className={cn(
                      "pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2",
                      isDark ? "text-slate-500" : "text-slate-400"
                    )}
                  />
                  <Input
                    id="whatsapp_number"
                    name="whatsapp_number"
                    type="tel"
                    placeholder="+919876543210"
                    value={form.whatsapp_number}
                    onChange={(event) =>
                      update("whatsapp_number", event.target.value)
                    }
                    className={cn(glassInput(isDark), "pl-9")}
                  />
                </div>
              </FieldShell>

              <FieldShell
                label="Instagram URL"
                htmlFor="instagram_url"
                isDark={isDark}
              >
                <div className="relative">
                  <InstagramIcon
                    className={cn(
                      "pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2",
                      isDark ? "text-slate-500" : "text-slate-400"
                    )}
                  />
                  <Input
                    id="instagram_url"
                    name="instagram_url"
                    type="url"
                    placeholder="https://instagram.com/studio"
                    value={form.instagram_url}
                    onChange={(event) =>
                      update("instagram_url", event.target.value)
                    }
                    className={cn(glassInput(isDark), "pl-9")}
                  />
                </div>
              </FieldShell>

              <div className="sm:col-span-2">
                <FieldShell
                  label="Facebook URL"
                  htmlFor="facebook_url"
                  isDark={isDark}
                >
                  <div className="relative">
                    <FacebookIcon
                      className={cn(
                        "pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2",
                        isDark ? "text-slate-500" : "text-slate-400"
                      )}
                    />
                    <Input
                      id="facebook_url"
                      name="facebook_url"
                      type="url"
                      placeholder="https://facebook.com/studio"
                      value={form.facebook_url}
                      onChange={(event) =>
                        update("facebook_url", event.target.value)
                      }
                      className={cn(glassInput(isDark), "pl-9")}
                    />
                  </div>
                </FieldShell>
              </div>
            </div>
          </section>
        ) : null}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="submit"
            className={cn(
              "h-10 rounded-full px-6 text-sm",
              isDark
                ? "bg-white/12 text-white hover:bg-white/18"
                : "bg-slate-900 text-white hover:bg-slate-800"
            )}
          >
            Continue
          </Button>
        </div>
      </form>
    </PagePanel>
  );
}
