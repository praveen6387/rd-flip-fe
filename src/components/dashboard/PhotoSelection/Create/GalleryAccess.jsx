"use client";

import { useEffect, useState } from "react";
import { Calendar, Check, Copy, KeyRound, Link2, Mail, MessageSquare, Pencil, RefreshCw, Send } from "lucide-react";
import { clientShareMessage } from "../_builder/panel";

function phoneDigits(value) {
  return String(value || "").replace(/\D/g, "").slice(-10);
}

export default function GalleryAccess({ form, accessCode, shareToken, studioName, saving, onCode, onDeadline, onWhatsapp, onWelcome, onUpdate }) {
  const [includeCode, setIncludeCode] = useState(true);
  const [copied, setCopied] = useState(false);
  const [channel, setChannel] = useState("whatsapp");
  const [editingPhone, setEditingPhone] = useState(false);
  const [origin, setOrigin] = useState("");
  useEffect(() => { setOrigin(window.location.origin); }, []);
  const base = `${origin}/photo-selection/${shareToken || ""}`;
  const link = includeCode && accessCode ? `${base}?code=${accessCode}` : base;
  const digits = phoneDigits(form.whatsapp || form.phone);
  const phone = digits.length === 10 ? `91${digits}` : digits;
  const displayPhone = digits.length === 10 ? `+91 ${digits.slice(0, 5)} ${digits.slice(5)}` : "No number saved";
  const message = clientShareMessage({ studioName, expiry: form.selectionDeadline, link, pin: accessCode, welcome: form.welcomeMessage });

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* the visible link can still be copied */ }
  }

  function openWhatsApp() {
    const text = encodeURIComponent(message);
    window.open(phone ? `https://api.whatsapp.com/send?phone=${phone}&text=${text}` : `https://api.whatsapp.com/send?text=${text}`, "_blank");
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-serif text-xl font-bold text-stone-900">Share Client Photo Gallery</h2>
        <p className="text-xs text-stone-500">Send private gallery access to {form.clientName || "your client"}{form.folderName ? ` · ${form.folderName}` : ""}</p>
      </div>
      <div className="space-y-3 rounded-2xl border border-stone-200 bg-stone-50/80 p-4">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 font-bold text-stone-800"><Link2 className="size-3.5" />Client gallery link</span>
          <span className="font-semibold text-emerald-700">Live after publish <a className="ml-2 text-stone-600 underline" href={link || "#"} target="_blank" rel="noreferrer">Test link</a></span>
        </div>
        <div className="flex gap-2">
          <input readOnly value={shareToken ? link : "The link is created with the gallery draft."} className="min-w-0 flex-1 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs text-stone-700" />
          <button type="button" disabled={!shareToken} onClick={copyLink} className="inline-flex items-center gap-1 rounded-xl bg-stone-900 px-3 py-2 text-xs font-bold text-white disabled:opacity-40">{copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}{copied ? "Copied" : "Copy link"}</button>
        </div>
        <label className="flex items-start gap-2 text-xs text-stone-700">
          <input type="checkbox" checked={includeCode} onChange={(event) => setIncludeCode(event.target.checked)} className="mt-0.5 size-4 accent-amber-600" />
          <span>Include the access code in the link (<span className="font-mono text-amber-700">?code={accessCode || "000000"}</span>) so the client opens the gallery immediately.</span>
        </label>
        <div className="flex items-center justify-between gap-2 border-t border-stone-200 pt-3">
          <span className="flex items-center gap-1.5 text-xs font-bold text-stone-800"><KeyRound className="size-3.5 text-amber-600" />Access code and selection deadline</span>
          <button type="button" disabled={saving} onClick={onUpdate} className="inline-flex items-center gap-1 rounded-lg bg-amber-700 px-3 py-1.5 text-[11px] font-bold text-white disabled:opacity-50"><RefreshCw className="size-3" />{saving ? "Saving…" : "Update"}</button>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="rounded-xl border border-stone-200 bg-white p-2">
            <span className="mb-1 flex items-center justify-between text-[10px] font-bold tracking-wider text-stone-500 uppercase">Access code <button type="button" onClick={() => onCode(String(Math.floor(100000 + Math.random() * 900000)))} className="font-semibold text-amber-700 normal-case">Random</button></span>
            <input inputMode="numeric" maxLength={6} value={accessCode} onChange={(event) => onCode(event.target.value.replace(/\D/g, "").slice(0, 6))} className="w-full font-mono text-lg tracking-[0.2em] outline-none" />
          </label>
          <label className="rounded-xl border border-stone-200 bg-white p-2">
            <span className="mb-1 flex items-center gap-1 text-[10px] font-bold tracking-wider text-stone-500 uppercase"><Calendar className="size-3" />Selection deadline</span>
            <input type="date" value={form.selectionDeadline || ""} onChange={(event) => onDeadline(event.target.value)} className="w-full text-xs outline-none" />
          </label>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-1 rounded-xl border border-stone-200 bg-stone-100 p-1">
        {[["whatsapp", "WhatsApp", Send], ["email", "Email", Mail], ["template", "Template", MessageSquare]].map(([id, label, Icon]) => (
          <button key={id} type="button" onClick={() => setChannel(id)} className={`inline-flex items-center justify-center gap-1 rounded-lg px-2 py-2 text-xs font-bold ${channel === id ? "bg-emerald-600 text-white" : "text-stone-600"}`}><Icon className="size-3.5" />{label}</button>
        ))}
      </div>
      {channel === "whatsapp" ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-stone-900">Direct WhatsApp share</p>
              <p className="text-[11px] text-stone-500">Sharing directly to {form.clientName || "the client"}</p>
            </div>
            <button type="button" onClick={openWhatsApp} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white"><Send className="size-4" />Share on WhatsApp{digits ? ` · ${displayPhone}` : ""}</button>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-stone-500">
            <span>Registered: {displayPhone}</span>
            <button type="button" onClick={() => setEditingPhone((current) => !current)} className="inline-flex items-center gap-1 font-semibold text-stone-700"><Pencil className="size-3" />Change number</button>
          </div>
          {editingPhone ? <input inputMode="numeric" maxLength={10} value={phoneDigits(form.whatsapp)} onChange={(event) => onWhatsapp(event.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="10-digit WhatsApp number" className="mt-2 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs outline-none" /> : null}
        </div>
      ) : null}
      {channel === "email" ? (
        <a href={`mailto:${form.clientEmail || ""}?subject=${encodeURIComponent(`Photo selection gallery - ${form.folderName || "your photos"}`)}&body=${encodeURIComponent(message)}`} className="flex items-center justify-center rounded-xl bg-sky-600 px-4 py-3 text-sm font-bold text-white">Email {form.clientEmail || "the client"}</a>
      ) : null}
      {channel === "template" ? <textarea readOnly value={message} rows={5} className="w-full rounded-xl border border-stone-200 bg-white p-3 text-xs text-stone-700" /> : null}
      <label className="block text-xs font-bold text-stone-700">Welcome message
        <textarea rows={2} maxLength={4000} value={form.welcomeMessage || ""} onChange={(event) => onWelcome(event.target.value)} className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-normal outline-none focus:ring-2 focus:ring-amber-500" />
      </label>
    </div>
  );
}
