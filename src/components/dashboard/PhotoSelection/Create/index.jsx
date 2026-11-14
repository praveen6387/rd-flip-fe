"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Calendar, Check, ChevronLeft, Clock, Eye, FileText, Heart, ImageIcon, Loader2, Mail, Phone, Send, Shield, Sparkles, Target, Type, UploadCloud, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import PagePanel from "@/components/dashboard/_builder/PagePanel";
import { useAuth } from "@/components/auth";
import { hasPhotoSelectionCredit } from "@/lib/credits";
import { updateSocialLinks, uploadStudioLogo } from "@/lib/api/client/auth";
import { ROUTES } from "@/lib/routes";
import { addPhotos, createDraft, getAlbum, publishAlbum, saveDraft } from "@/lib/photo-selection/store";
import { acceptedSelectionFiles, clientShareMessage } from "../_builder/panel";
import { prepareSelectionPhotos } from "../_builder/prepare";
import SelectionProgress from "../_builder/SelectionProgress";
import OccasionUpload, { occasionRelativePath } from "./OccasionUpload";
import SelectionRules from "./SelectionRules";
import GalleryAccess from "./GalleryAccess";
import NexpicCanvas from "../_builder/NexpicCanvas";

const STEPS = [
  { id: 1, name: "Client Details", subtitle: "Couple & event", icon: User },
  { id: 2, name: "Upload Photos", subtitle: "Folder & files", icon: UploadCloud },
  { id: 3, name: "Selection Rules", subtitle: "Limits & sheets", icon: Target },
  { id: 4, name: "Gallery Access", subtitle: "Share & code", icon: Shield },
  { id: 5, name: "Review & Publish", subtitle: "Final check", icon: Eye },
];

const emptyForm = {
  folderName: "", clientName: "", phone: "", whatsapp: "", clientEmail: "", eventDate: "", selectionDeadline: "", photographerNotes: "", welcomeMessage: "", originalFolderPath: "",
  selectionMode: "UNLIMITED", requiredPhotos: 100, includedPhotos: 100, allowExtraPhotos: true, strictLimit: false,
  maxSelectionLimit: 100, photosPerSheet: 4, includedSheets: 25, enableExtraPhotoPricing: false, extraPhotoPrice: 50,
  enableExtraSheetPricing: false, extraSheetPrice: 300,
};

function localOffsetDate(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function phoneDigits(value) {
  let digits = String(value || "").replace(/\D/g, "");
  if (digits.length > 10 && digits.startsWith("91")) digits = digits.slice(2);
  else if (digits.length > 10 && digits.startsWith("0")) digits = digits.slice(1);
  while (digits && !/^[6-9]/.test(digits)) digits = digits.slice(1);
  return digits.slice(0, 10);
}

function formFromAlbum(album) {
  return {
    ...emptyForm,
    folderName: album.folderName || "",
    clientName: album.clientName || "",
    phone: album.phone || "",
    whatsapp: album.whatsapp || "",
    clientEmail: album.clientEmail || "",
    eventDate: album.eventDate || "",
    selectionDeadline: album.selectionDeadline || "",
    photographerNotes: album.photographerNotes || "",
    welcomeMessage: album.welcomeMessage || "",
    originalFolderPath: album.originalFolderPath || "",
    selectionMode: album.selectionMode || album.rules?.selectionMode || "FIXED",
    requiredPhotos: album.requiredPhotos ?? album.rules?.requiredPhotos ?? 100,
    includedPhotos: album.includedPhotos ?? album.rules?.includedPhotos ?? 100,
    allowExtraPhotos: album.allowExtraPhotos ?? album.rules?.allowExtraPhotos ?? true,
    strictLimit: album.strictLimit ?? album.rules?.strictLimit ?? false,
    maxSelectionLimit: album.maxSelectionLimit ?? 100,
    photosPerSheet: album.photosPerSheet ?? album.rules?.photosPerSheet ?? 4,
    includedSheets: album.includedSheets ?? 25,
    enableExtraPhotoPricing: Boolean(album.enableExtraPhotoPricing),
    extraPhotoPrice: album.extraPhotoPrice ?? 50,
    enableExtraSheetPricing: Boolean(album.enableExtraSheetPricing),
    extraSheetPrice: album.extraSheetPrice ?? 300,
  };
}

export default function PhotoSelectionCreate() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resumeId = searchParams.get("album");
  const requestedStep = Number(searchParams.get("step") || 0);
  const { user, ready, applyUser } = useAuth();
  const [step, setStep] = useState(1);
  const [albumId, setAlbumId] = useState(resumeId);
  const [form, setForm] = useState(emptyForm);
  const [photoCount, setPhotoCount] = useState(0);
  const [photos, setPhotos] = useState([]);
  const [accessCode, setAccessCode] = useState("");
  const [shareToken, setShareToken] = useState("");
  const [folderName, setFolderName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [work, setWork] = useState(null);
  const [error, setError] = useState("");
  const [published, setPublished] = useState(null);
  const [rulesPane, setRulesPane] = useState("rules");
  const [markOn, setMarkOn] = useState(true);
  const [markText, setMarkText] = useState("");
  const [markLogo, setMarkLogo] = useState(false);
  const [logoUrl, setLogoUrl] = useState("");
  const [logoPreview, setLogoPreview] = useState("");
  const [logoBusy, setLogoBusy] = useState(false);
  const markLoaded = useRef(false);
  const logoTouched = useRef(false);

  useEffect(() => {
    if (!user || markLoaded.current) return;
    markLoaded.current = true;
    setMarkOn(user.watermark_enabled !== false);
    setMarkText(user.watermark_text || "");
  }, [user]);

  useEffect(() => {
    if (!user || logoTouched.current) return;
    const url = user.watermark_logo_url || "";
    setLogoUrl(url);
    setLogoPreview(user.watermark_logo_preview || "");
    setMarkLogo(Boolean(url) && user.watermark_include_logo !== false);
  }, [user]);

  useEffect(() => {
    if (!ready) return undefined;
    let ignore = false;
    (async () => {
      if (!hasPhotoSelectionCredit(user)) {
        if (!ignore) router.replace("/dashboard/plans");
        return;
      }
      if (!resumeId) {
        if (!ignore) setLoading(false);
        return;
      }
      try {
        const album = await getAlbum(resumeId);
        if (ignore) return;
        if (album.status !== "draft") {
          router.replace(ROUTES.dashboardPhotoSelectionView(resumeId));
          return;
        }
        setAlbumId(album.id);
        setAccessCode(album.accessCode || "");
        setShareToken(album.shareToken || "");
        setPhotoCount(album.photoCount || album.photos?.length || 0);
        setPhotos(album.photos || []);
        setFolderName(album.originalFolderPath || "");
        setStep(requestedStep >= 1 && requestedStep <= 5 ? requestedStep : Math.min(5, Math.max(1, album.wizardStep || 1)));
        setForm(formFromAlbum(album));
      } catch (loadError) {
        if (!ignore) setError(loadError.message || "Could not open this gallery.");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [ready, resumeId, router, user]);

  function change(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function patchForm(updates) {
    setForm((current) => ({ ...current, ...updates }));
  }

  function payload(nextStep) {
    return { ...form, id: albumId || crypto.randomUUID(), wizardStep: nextStep, phone: phoneDigits(form.phone), whatsapp: phoneDigits(form.whatsapp), eventDate: form.eventDate || null, selectionDeadline: form.selectionDeadline || null };
  }

  async function persist(nextStep) {
    const body = payload(nextStep);
    if (/^\d{6}$/.test(accessCode)) body.accessCode = accessCode;
    if (body.phone && !/^[6-9]\d{9}$/.test(body.phone)) throw new Error("Enter a 10-digit mobile number starting with 6, 7, 8, or 9.");
    if (body.whatsapp && !/^[6-9]\d{9}$/.test(body.whatsapp)) throw new Error("Enter a 10-digit WhatsApp number starting with 6, 7, 8, or 9.");
    if (!body.folderName.trim() || !body.clientName.trim()) throw new Error("Couple name and client name are required.");
    const album = albumId ? await saveDraft(albumId, body) : await createDraft(body);
    setAlbumId(album.id);
    setAccessCode(album.accessCode || "");
    setShareToken(album.shareToken || "");
    return album;
  }

  async function updateShare() {
    if (!/^\d{6}$/.test(accessCode)) {
      setError("The access code must be 6 digits.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await persist(4);
    } catch (saveError) {
      setError(saveError.message || "Could not update gallery access.");
    } finally {
      setSaving(false);
    }
  }

  async function go(nextStep) {
    const savedStep = nextStep === "done" ? 2 : nextStep;
    setSaving(true);
    setError("");
    try {
      if (savedStep === 4) {
        if (form.selectionMode === "FIXED" && Number(form.requiredPhotos) > photoCount) throw new Error(`Required photos (${form.requiredPhotos}) cannot exceed the ${photoCount} uploaded photos.`);
        if (form.selectionMode === "MIN_EXTRA" && Number(form.includedPhotos) > photoCount) throw new Error(`Included photos (${form.includedPhotos}) cannot exceed the ${photoCount} uploaded photos.`);
      }
      const album = await persist(savedStep);
      setStep(savedStep);
      router.replace(`${ROUTES.dashboardPhotoSelectionNew}?album=${album.id}&step=${savedStep}`);
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  async function uploadChosen(chosen, category) {
    if (!chosen.length || !albumId) return false;
    const filtered = acceptedSelectionFiles(chosen);
    const accepted = [...filtered.accepted, ...chosen.filter((file) => !filtered.accepted.includes(file) && /\.(jpe?g|png|webp)$/i.test(file.name))];
    if (!accepted.length) {
      setError("Choose JPG, PNG, or WebP photos.");
      return false;
    }
    accepted.forEach((file) => {
      if (!file.selectionRelativePath) file.selectionRelativePath = occasionRelativePath(file, category);
    });
    if (new Set(accepted.map((file) => file.selectionRelativePath)).size !== accepted.length) {
      setError("Two photos in this folder share the same name and subfolder.");
      return false;
    }
    setError("");
    try {
      setWork({ phase: "optimize", current: 0, total: accepted.length, name: accepted[0].name });
      const prepared = await prepareSelectionPhotos(accepted, (progress) => setWork({ phase: "optimize", ...progress }));
      setWork({ phase: "upload", current: 0, total: prepared.length });
      await addPhotos(albumId, prepared, setWork, false);
      const album = await getAlbum(albumId);
      setPhotoCount(album.photoCount || album.photos?.length || 0);
      setPhotos(album.photos || []);
      const browsed = accepted.find((file) => file.webkitRelativePath)?.webkitRelativePath?.split("/")?.[0] || "";
      if (browsed) {
        setFolderName(browsed);
        change("originalFolderPath", browsed);
        await saveDraft(albumId, { originalFolderPath: browsed, wizardStep: 2 });
      }
    } catch (uploadError) {
      setError(uploadError.message);
      return false;
    } finally {
      setWork(null);
    }
    return true;
  }

  async function chooseLogo(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    logoTouched.current = true;
    setLogoBusy(true);
    setError("");
    try {
      const saved = await uploadStudioLogo(file);
      setLogoUrl(saved.imageUrl || "");
      setLogoPreview(URL.createObjectURL(file));
      setMarkLogo(true);
    } catch (uploadError) {
      setError(uploadError.message || "Could not upload the studio logo.");
    } finally {
      setLogoBusy(false);
    }
  }

  async function saveWatermark() {
    setSaving(true);
    setError("");
    try {
      const result = await updateSocialLinks({
        watermark_enabled: markOn,
        watermark_text: markText.trim().slice(0, 120),
        watermark_position: user?.watermark_position || "bottom-right",
        watermark_opacity: Number(user?.watermark_opacity) || 0.45,
        watermark_include_logo: Boolean(markOn && markLogo && logoUrl),
        watermark_logo_url: logoUrl,
      });
      if (result.data?.user) applyUser(result.data.user);
      await go(4);
    } catch (saveError) {
      setError(saveError.message || "Could not save the watermark.");
      setSaving(false);
    }
  }

  async function publish() {
    setSaving(true);
    setError("");
    try {
      await persist(5);
      setPublished(await publishAlbum(albumId));
    } catch (publishError) {
      setError(publishError.message);
    } finally {
      setSaving(false);
    }
  }

  if (!ready || loading) {
    return <NexpicCanvas bleed><PagePanel><div className="grid min-h-80 place-items-center"><Loader2 className="animate-spin text-stone-400" size={28} /></div></PagePanel></NexpicCanvas>;
  }

  return (
    <NexpicCanvas bleed>
    <PagePanel>
      <div className="mx-auto max-w-5xl">
        <div className="mb-4 flex items-center justify-between gap-3 border-b border-stone-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 text-white shadow-lg shadow-amber-600/30"><Sparkles className="size-5" /></div>
            <div>
              <h1 className="font-serif text-xl font-bold text-stone-900">{resumeId ? "Resume client gallery" : "Create New Client Gallery"}</h1>
              <p className="text-xs text-stone-500">Fill client & couple details and click Done. You can upload photos & set rules right after.</p>
            </div>
          </div>
          <Link href={ROUTES.dashboardPhotoSelection} className="rounded-xl p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-700" aria-label="Close"><X className="size-5" /></Link>
        </div>
        {resumeId || step > 1 ? <div className="mb-6 grid grid-cols-2 gap-2 md:grid-cols-5">
          {STEPS.map((item) => {
            const Icon = item.icon;
            const done = item.id < step;
            const active = item.id === step;
            return (
              <button key={item.id} type="button" onClick={() => item.id < step && setStep(item.id)} className={`rounded-2xl border p-3 text-left ${active ? "border-amber-700 bg-amber-700 text-white" : done ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-stone-200 bg-white text-stone-400"}`}>
                <Icon size={16} />
                <p className="mt-2 text-xs font-bold">{item.name}</p>
                <p className="text-[10px] opacity-70">{item.subtitle}</p>
              </button>
            );
          })}
        </div> : null}
        {error ? <p className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
        <div className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm">
          {step === 1 ? (
            <div className="mx-auto max-w-4xl space-y-5">
              <div className="flex items-start gap-3.5 rounded-2xl border-2 border-amber-400/40 bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-transparent p-4 text-xs text-amber-950">
                <div className="grid size-10 shrink-0 place-items-center rounded-2xl bg-amber-500/20 text-amber-700"><User className="size-5" /></div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-stone-900">Couple & Client Details <span className="rounded-full border border-amber-500/40 bg-amber-500/25 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-900">STEP 1 OF SETUP</span></div>
                  <p className="mt-1 leading-relaxed text-stone-600">Fill client & couple contact details and click <strong>Done</strong>. You can configure photo upload and selection rules right after.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <IconField icon={<Heart className="size-3.5 fill-rose-500/30 text-rose-500" />} label="Couple Name" required value={form.folderName} onChange={(value) => change("folderName", value)} placeholder="e.g. Rahul & Priya (Bride & Groom)" />
                <IconField icon={<User className="size-3.5 text-amber-600" />} label="Client / Booked By" required value={form.clientName} onChange={(value) => change("clientName", value)} placeholder="e.g. Rahul Sharma or Sharma Family" />
                <PhoneField label="Mobile Number" icon={<Phone className="size-3.5 text-amber-600" />} value={form.phone} onChange={(value) => change("phone", phoneDigits(value))} placeholder="98765 43210" />
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-stone-700"><Send className="size-3.5 text-emerald-600" />WhatsApp Number</span>
                    {form.phone ? <button type="button" onClick={() => change("whatsapp", phoneDigits(form.phone))} className="text-[10px] font-semibold text-amber-700 hover:underline">Same as Mobile</button> : null}
                  </div>
                  <div className="relative"><span className="absolute top-2.5 left-3 flex items-center gap-1 text-xs font-bold text-stone-500">🇮🇳 +91</span><input inputMode="numeric" maxLength={10} value={form.whatsapp} onChange={(event) => change("whatsapp", phoneDigits(event.target.value))} placeholder="98765 43210 (WhatsApp)" className="w-full rounded-xl border border-stone-200 bg-stone-50 py-2.5 pr-3 pl-16 font-mono text-xs tracking-wide outline-none focus:ring-2 focus:ring-amber-500" /></div>
                  <PhoneHint value={form.whatsapp} label="WhatsApp" />
                </div>
                <IconField icon={<Calendar className="size-3.5 text-amber-600" />} label="Event Date" type="date" value={form.eventDate} onChange={(value) => change("eventDate", value)} />
                <div>
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-stone-700"><Clock className="size-3.5 text-amber-500" />Selection Deadline</span>
                    <div className="flex gap-1">{[{ label: "+7 Days", days: 7 }, { label: "+15 Days", days: 15 }, { label: "+30 Days", days: 30 }, { label: "+60 Days", days: 60 }].map((preset) => { const target = localOffsetDate(preset.days); return <button key={preset.days} type="button" onClick={() => change("selectionDeadline", target)} className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${form.selectionDeadline === target ? "bg-amber-500 text-stone-950" : "border border-stone-200 bg-stone-100 text-stone-600"}`}>{preset.label}</button>; })}</div>
                  </div>
                  <input type="date" value={form.selectionDeadline} onChange={(event) => change("selectionDeadline", event.target.value)} className="w-full cursor-pointer rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 text-xs outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
                <div className="sm:col-span-2">
                  <div className="mb-1.5 flex items-center justify-between"><span className="flex items-center gap-1.5 text-xs font-bold text-stone-700"><Mail className="size-3.5 text-amber-600" />Email Address</span><span className="text-[11px] text-stone-400">(Optional)</span></div>
                  <input type="email" value={form.clientEmail} onChange={(event) => change("clientEmail", event.target.value)} placeholder="Optional (e.g. client@gmail.com)" className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 text-xs outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
                <label className="sm:col-span-2 text-xs font-bold text-stone-700">
                  <span className="mb-1.5 flex items-center gap-1.5"><FileText className="size-3.5 text-stone-400" />Photographer Notes (Optional / Private)</span>
                  <textarea rows={3} maxLength={4000} value={form.photographerNotes} onChange={(event) => change("photographerNotes", event.target.value)} placeholder="Special requirements, album package details, venue notes..." className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 text-xs font-normal outline-none focus:ring-2 focus:ring-amber-500" />
                </label>
              </div>
            </div>
          ) : null}
          {step === 2 ? <OccasionUpload photos={photos} disabled={Boolean(work) || !albumId} onUpload={uploadChosen} /> : null}
          {step === 3 ? (
            <div>
              <div className="mb-4">
                <h2 className="font-serif text-xl font-bold text-stone-900">{rulesPane === "watermark" ? "Watermark & Security Settings" : "Configure Photo Selection Mode"}</h2>
                <p className="text-xs text-stone-500">{rulesPane === "watermark" ? "Control the studio watermark on client photos." : "Choose how your client selects photos from their gallery"}</p>
              </div>
              <div className="mb-4 flex items-center justify-between border-b border-stone-200 pb-3">
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setRulesPane("rules")} className={`inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold ${rulesPane === "rules" ? "border border-amber-500/40 bg-amber-500/20 text-amber-800" : "bg-stone-100 text-stone-600"}`}><Target className="size-3.5 text-amber-600" />1. Selection Rules</button>
                  <span className="font-bold text-stone-300">➔</span>
                  <button type="button" onClick={() => setRulesPane("watermark")} className={`inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold ${rulesPane === "watermark" ? "border border-amber-500/40 bg-amber-500/20 text-amber-800" : "bg-stone-100 text-stone-600"}`}><Shield className="size-3.5 text-amber-600" />2. Watermark & Security</button>
                </div>
                <span className="hidden font-mono text-[11px] text-stone-400 sm:inline">Step {rulesPane === "watermark" ? "2" : "1"} of 2</span>
              </div>
              {rulesPane === "rules" ? <SelectionRules form={form} photoCount={photoCount} onChange={patchForm} /> : (
                <div className="space-y-3 rounded-2xl border border-amber-200/80 bg-amber-50/60 p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-stone-900 uppercase"><Shield className="size-4 text-amber-600" />Client gallery watermark</div>
                  <p className="text-[11px] text-stone-500">This watermark is saved on your studio profile and drawn over client photos. It is not burned into the files.</p>
                  <label className="flex items-start gap-2.5 text-xs">
                    <input type="checkbox" checked={markOn} onChange={(event) => setMarkOn(event.target.checked)} className="mt-0.5 size-4 accent-amber-600" />
                    <span><span className="flex items-center gap-1.5 font-medium text-stone-800"><Type className="size-3.5 text-stone-500" />Show text watermark</span><span className="block text-[11px] text-stone-500">Show copyright or studio text across client photos</span></span>
                  </label>
                  {markOn ? <input value={markText} maxLength={120} onChange={(event) => setMarkText(event.target.value)} placeholder={user?.studio_name ? `© ${user.studio_name}` : "© Studio"} className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-amber-500" /> : null}
                  <div className="flex flex-wrap items-center gap-3 rounded-xl border border-stone-200 bg-white p-3">
                    <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-stone-900">{logoPreview ? <img src={logoPreview} alt="Studio logo" className="h-full w-full object-contain p-1" /> : <ImageIcon className="size-5 text-stone-500" />}</div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-stone-800">Studio logo watermark</p>
                      <p className="text-[11px] text-stone-500">{logoUrl ? "Using the logo from your profile. It is drawn over client photos with the text." : "Upload a logo on your profile. PNG, JPG, or WebP up to 2 MB."}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <label className={`inline-flex cursor-pointer items-center gap-1 rounded-lg bg-amber-700 px-3 py-1.5 text-[11px] font-bold text-white ${logoBusy ? "opacity-50" : ""}`}>
                          <UploadCloud className="size-3.5" />{logoBusy ? "Uploading…" : "Upload logo"}
                          <input type="file" accept="image/png,image/jpeg,image/webp" disabled={logoBusy} onChange={chooseLogo} className="hidden" />
                        </label>
                        {logoUrl ? <button type="button" onClick={() => { logoTouched.current = true; setLogoUrl(""); setLogoPreview(""); setMarkLogo(false); }} className="text-[11px] font-semibold text-rose-700">Remove</button> : null}
                      </div>
                    </div>
                    <label className={`flex items-center gap-2 text-xs font-medium ${logoUrl && markOn ? "text-stone-800" : "text-stone-400"}`}>
                      <input type="checkbox" checked={markLogo && Boolean(logoUrl)} disabled={!logoUrl || !markOn} onChange={(event) => setMarkLogo(event.target.checked)} className="size-4 accent-amber-600" />
                      Show logo
                    </label>
                  </div>
                </div>
              )}
            </div>
          ) : null}
          {step === 4 ? (
            <GalleryAccess
              form={form}
              accessCode={accessCode}
              shareToken={shareToken}
              studioName={user?.studio_name}
              saving={saving}
              onCode={setAccessCode}
              onDeadline={(value) => change("selectionDeadline", value)}
              onWhatsapp={(value) => change("whatsapp", value)}
              onWelcome={(value) => change("welcomeMessage", value)}
              onUpdate={updateShare}
            />
          ) : null}
          {step === 5 ? (
            <div className="space-y-3 text-sm text-stone-700">
              <p className="font-serif text-2xl text-stone-900">{form.folderName}</p>
              <p>{form.clientName} · +91 {phoneDigits(form.phone)}</p>
              <p>{photoCount} photos · {form.selectionMode === "FIXED" ? `${form.requiredPhotos} required` : form.selectionMode === "MIN_EXTRA" ? `${form.includedPhotos} included, extras ${form.allowExtraPhotos ? "allowed" : "off"}` : "Unlimited until you save a target"}</p>
              <p>Client code {accessCode || "is created with the draft"}. Publishing uses one photo-selection credit and opens the gallery.</p>
              <div className="flex flex-wrap gap-2">{[1, 2, 3, 4].map((item) => <button key={item} type="button" onClick={() => setStep(item)} className="rounded-full border px-3 py-1 text-xs font-semibold">Edit step {item}</button>)}</div>
            </div>
          ) : null}
          <div className="mt-6 flex items-center justify-between gap-3 border-t border-stone-200 pt-4">
            {step === 1 ? <Button variant="secondary" asChild><Link href={ROUTES.dashboardPhotoSelection}><ChevronLeft className="size-4" />Back</Link></Button> : step === 3 && rulesPane === "watermark" ? <button type="button" disabled={saving} onClick={() => setRulesPane("rules")} className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-stone-700">Back (Selection Rules)</button> : step === 3 ? <button type="button" disabled={saving} onClick={() => setStep(2)} className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-stone-700">Cancel</button> : <Button variant="secondary" disabled={saving || Boolean(work)} onClick={() => setStep((value) => value - 1)}><ChevronLeft className="size-4" />Back</Button>}
            <div className="flex gap-2">
              {step === 1 ? <button type="button" disabled={saving} onClick={() => go("done")} className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-amber-600/30 hover:bg-amber-500 disabled:opacity-50"><Check className="size-4" />{saving ? "Saving…" : "Done"}</button> : null}
              {step === 3 && rulesPane === "rules" ? <button type="button" disabled={saving} onClick={() => setRulesPane("watermark")} className="inline-flex items-center gap-2 rounded-xl bg-amber-700 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-amber-700/30 hover:bg-amber-600 disabled:opacity-50">Next: Watermark & Security <ArrowRight className="size-3.5" /></button> : null}
              {step === 3 && rulesPane === "watermark" ? <button type="button" disabled={saving} onClick={saveWatermark} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white disabled:opacity-50">{saving ? "Saving…" : "Save watermark & continue"}</button> : null}
              {step > 1 && step < 5 && step !== 3 ? <Button disabled={saving || Boolean(work) || (step === 2 && !albumId)} onClick={() => go(step + 1)}>{saving ? "Saving…" : "Save & continue"}</Button> : null}
              {step === 5 ? <Button disabled={saving || !photoCount} onClick={publish}>{saving ? "Publishing…" : "Publish gallery"}</Button> : null}
            </div>
          </div>
        </div>
      </div>
      <SelectionProgress state={work} />
      {published ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-stone-950/50 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 text-center">
            <Check className="mx-auto text-emerald-600" />
            <h2 className="mt-3 font-serif text-3xl text-stone-900">Gallery published</h2>
            <p className="mt-2 break-all text-sm text-stone-500">{typeof window === "undefined" ? "" : `${window.location.origin}/photo-selection/${published.shareToken}`}</p>
            <p className="mt-2 font-mono text-2xl tracking-[0.3em]">{published.accessCode}</p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <Button onClick={() => navigator.clipboard.writeText(`${window.location.origin}/photo-selection/${published.shareToken}`)}>Copy link</Button>
              <Button variant="secondary" onClick={() => { const phone = phoneDigits(form.whatsapp || form.phone); const link = `${window.location.origin}/photo-selection/${published.shareToken}`; const text = encodeURIComponent(clientShareMessage({ studioName: user?.studio_name, expiry: form.selectionDeadline, link, pin: published.accessCode, welcome: form.welcomeMessage })); window.open(phone ? `https://api.whatsapp.com/send?phone=91${phone}&text=${text}` : `https://api.whatsapp.com/send?text=${text}`, "_blank"); }}>WhatsApp</Button>
              <Button variant="secondary" asChild><Link href={ROUTES.dashboardPhotoSelectionView(published.id)}>Open gallery</Link></Button>
            </div>
          </div>
        </div>
      ) : null}
    </PagePanel>
    </NexpicCanvas>
  );
}

function IconField({ icon, label, required = false, value, onChange, placeholder = "", type = "text" }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-stone-700">{icon}{label}{required ? " *" : ""}</span>
      <input type={type} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 text-xs outline-none focus:ring-2 focus:ring-amber-500" />
    </label>
  );
}

function PhoneHint({ value, label }) {
  if (!value) return null;
  const valid = /^[6-9]\d{9}$/.test(value);
  return <p className={`mt-1 pl-1 text-[10px] font-medium ${valid ? "text-emerald-600" : "text-amber-600"}`}>{valid ? <><Check className="mr-1 inline size-3" />Valid 10-digit {label}: {value}</> : `${value.length}/10 digits entered (must start with 6, 7, 8, or 9)`}</p>;
}

function PhoneField({ label, icon, value, onChange, placeholder }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between"><span className="flex items-center gap-1.5 text-xs font-bold text-stone-700">{icon}{label}</span><span className="text-[10px] text-stone-400">10 digits (starts with 6-9)</span></div>
      <div className="relative"><span className="absolute top-2.5 left-3 flex items-center gap-1 text-xs font-bold text-stone-500">🇮🇳 +91</span><input inputMode="numeric" maxLength={10} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full rounded-xl border border-stone-200 bg-stone-50 py-2.5 pr-3 pl-16 font-mono text-xs tracking-wide outline-none focus:ring-2 focus:ring-amber-500" /></div>
      <PhoneHint value={value} label="mobile" />
    </div>
  );
}

function Field({ label, value, onChange, hint, type = "text", placeholder = "" }) {
  return (
    <label className="block text-sm font-medium text-stone-700">
      {label}
      <input type={type} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2.5 outline-none focus:border-stone-900" />
      {hint ? <span className="mt-1 block text-xs text-stone-400">{hint}</span> : null}
    </label>
  );
}
