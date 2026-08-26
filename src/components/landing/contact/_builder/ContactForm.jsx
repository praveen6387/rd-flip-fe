"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ContactForm() {
  return (
    <form
      className="rounded-3xl border border-white/70 bg-white/45 p-6 shadow-[0_12px_40px_-24px_rgba(79,70,229,0.3)] ring-1 ring-white/40 backdrop-blur-xl sm:p-8"
      onSubmit={(event) => event.preventDefault()}
    >
      <div className="grid gap-5">
        <div className="grid gap-2">
          <Label htmlFor="contact-name" className="text-sm font-medium text-slate-600">
            Name
          </Label>
          <Input
            id="contact-name"
            required
            className="h-11 rounded-xl border-slate-200/80 bg-white/70 text-base text-slate-900 placeholder:text-slate-400 focus-visible:border-indigo-300 focus-visible:ring-indigo-200/60"
            placeholder="Studio or your name"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="contact-email" className="text-sm font-medium text-slate-600">
            Email
          </Label>
          <Input
            id="contact-email"
            type="email"
            required
            className="h-11 rounded-xl border-slate-200/80 bg-white/70 text-base text-slate-900 placeholder:text-slate-400 focus-visible:border-indigo-300 focus-visible:ring-indigo-200/60"
            placeholder="you@studio.in"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="contact-message" className="text-sm font-medium text-slate-600">
            Message
          </Label>
          <Textarea
            id="contact-message"
            required
            className="min-h-28 rounded-xl border-slate-200/80 bg-white/70 text-base text-slate-900 placeholder:text-slate-400 focus-visible:border-indigo-300 focus-visible:ring-indigo-200/60"
            placeholder="Tell us what you need help with…"
          />
        </div>
        <Button className="mt-1 h-11 w-full rounded-full bg-linear-to-r from-indigo-500 to-sky-600 text-sm font-semibold text-white hover:from-indigo-600 hover:to-sky-700 sm:w-fit sm:px-8">
          Send message
        </Button>
      </div>
    </form>
  );
}
