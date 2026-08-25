"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ContactForm() {
  return (
    <form className="grid gap-5" onSubmit={(event) => event.preventDefault()}>
      <div className="grid gap-2">
        <Label htmlFor="contact-name" className="text-white/70">
          Name
        </Label>
        <Input
          id="contact-name"
          required
          className="rounded-none border-0 border-b border-white/20 bg-transparent text-white"
          placeholder="Studio or your name"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="contact-email" className="text-white/70">
          Email
        </Label>
        <Input
          id="contact-email"
          type="email"
          required
          className="rounded-none border-0 border-b border-white/20 bg-transparent text-white"
          placeholder="you@studio.in"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="contact-message" className="text-white/70">
          Note
        </Label>
        <Textarea
          id="contact-message"
          required
          className="min-h-24 rounded-none border-0 border-b border-white/20 bg-transparent text-white"
          placeholder="Dates, headcount, anything odd about the cover."
        />
      </div>
      <Button className="mt-2 h-10 w-fit rounded-none bg-[#d4af37] px-8 text-black hover:bg-[#e4c35a]">
        Send to desk
      </Button>
    </form>
  );
}
