"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createContactMessage } from "@/lib/api/client/contact";
import { cn } from "@/lib/cn";
import MotionCard from "@/components/landing/_builder/MotionCard";

const EMPTY = {
  name: "",
  email: "",
  phone_number: "",
  message: "",
};

export default function ContactForm({ isDark = false }) {
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fieldClass = cn(
    "h-11 rounded-xl text-base focus-visible:border-indigo-300 focus-visible:ring-indigo-200/60",
    isDark
      ? "border-white/15 bg-white/10 text-white placeholder:text-slate-400"
      : "border-slate-200/80 bg-white/70 text-slate-900 placeholder:text-slate-400"
  );

  const labelClass = cn(
    "text-sm font-medium",
    isDark ? "text-slate-300" : "text-slate-600"
  );

  function updateField(key) {
    return (event) => {
      setForm((prev) => ({ ...prev, [key]: event.target.value }));
      if (error) setError("");
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await createContactMessage({
        name: form.name.trim(),
        email: form.email.trim(),
        phone_number: form.phone_number.trim(),
        message: form.message.trim(),
      });
      toast.success("Message sent. We’ll get back to you soon.");
      setForm(EMPTY);
    } catch (err) {
      const message =
        err?.message || "Could not send your message. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <MotionCard
      index={0}
      as="form"
      className={cn(
        "rounded-3xl border p-6 shadow-[0_12px_40px_-24px_rgba(79,70,229,0.3)] ring-1 backdrop-blur-xl sm:p-8",
        isDark
          ? "border-white/15 bg-white/8 ring-white/10"
          : "border-white/70 bg-white/45 ring-white/40"
      )}
      onSubmit={handleSubmit}
      hover={false}
    >
      <div className="grid gap-5">
        <div className="grid gap-2">
          <Label htmlFor="contact-name" className={labelClass}>
            Name
          </Label>
          <Input
            id="contact-name"
            name="name"
            required
            value={form.name}
            onChange={updateField("name")}
            disabled={submitting}
            className={fieldClass}
            placeholder="Studio or your name"
            autoComplete="name"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="contact-phone" className={labelClass}>
              Phone number
            </Label>
            <Input
              id="contact-phone"
              name="phone_number"
              type="tel"
              required
              value={form.phone_number}
              onChange={updateField("phone_number")}
              disabled={submitting}
              className={fieldClass}
              placeholder="10-digit mobile"
              autoComplete="tel"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="contact-email" className={labelClass}>
              Email
            </Label>
            <Input
              id="contact-email"
              name="email"
              type="email"
              required
              value={form.email}
              onChange={updateField("email")}
              disabled={submitting}
              className={fieldClass}
              placeholder="you@studio.in"
              autoComplete="email"
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="contact-message" className={labelClass}>
            Message
          </Label>
          <Textarea
            id="contact-message"
            name="message"
            required
            value={form.message}
            onChange={updateField("message")}
            disabled={submitting}
            className={cn(
              "min-h-28 rounded-xl text-base focus-visible:border-indigo-300 focus-visible:ring-indigo-200/60",
              isDark
                ? "border-white/15 bg-white/10 text-white placeholder:text-slate-400"
                : "border-slate-200/80 bg-white/70 text-slate-900 placeholder:text-slate-400"
            )}
            placeholder="Tell us what you need help with…"
          />
        </div>

        {error ? (
          <p
            className={cn(
              "rounded-xl border px-3.5 py-2.5 text-sm leading-6",
              isDark
                ? "border-rose-400/30 bg-rose-500/15 text-rose-200"
                : "border-rose-200 bg-rose-50 text-rose-700"
            )}
          >
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          disabled={submitting}
          className="mt-1 h-11 w-full rounded-full bg-linear-to-r from-indigo-500 to-sky-600 text-sm font-semibold text-white hover:from-indigo-600 hover:to-sky-700 sm:w-fit sm:px-8"
        >
          {submitting ? "Sending…" : "Send message"}
        </Button>
      </div>
    </MotionCard>
  );
}
