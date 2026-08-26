"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ContactForm() {
  return (
    <form
      className="grid gap-6 rounded-2xl border border-slate-200 bg-white/80 p-7 shadow-sm"
      onSubmit={(event) => event.preventDefault()}
    >
      <div className="grid gap-2">
        <Label htmlFor="contact-name" className="text-base text-slate-700">
          Name
        </Label>
        <Input
          id="contact-name"
          required
          className="h-11 rounded-xl border-slate-200 bg-white text-base text-slate-900"
          placeholder="Studio or your name"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="contact-email" className="text-base text-slate-700">
          Email
        </Label>
        <Input
          id="contact-email"
          type="email"
          required
          className="h-11 rounded-xl border-slate-200 bg-white text-base text-slate-900"
          placeholder="you@studio.in"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="contact-message" className="text-base text-slate-700">
          Note
        </Label>
        <Textarea
          id="contact-message"
          required
          className="min-h-28 rounded-xl border-slate-200 bg-white text-base text-slate-900"
          placeholder="Dates, headcount, anything odd about the cover."
        />
      </div>
      <Button className="mt-1 h-12 w-fit rounded-full bg-linear-to-r from-indigo-500 to-sky-600 px-8 text-base text-white hover:from-indigo-600 hover:to-sky-700">
        Send to desk
      </Button>
    </form>
  );
}
