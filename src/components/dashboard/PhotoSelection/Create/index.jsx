"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ArrowRight, Calendar, Check, ChevronLeft, Clock, Eye, FileText, Heart, ImageIcon, Loader2, Mail, Pencil, Phone, Send, Shield, Sparkles, Target, Type, UploadCloud, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import PagePanel from "@/components/dashboard/_builder/PagePanel";
import { useAuth } from "@/components/auth";
import { hasPhotoSelectionCredit } from "@/lib/credits";
import { updateSocialLinks, uploadStudioLogo } from "@/lib/api/client/auth";
import { ROUTES } from "@/lib/routes";
import { sourceRelativePath } from "@/lib/photo-selection/folder";
import { addPhotos, createDraft, getAlbum, publishAlbum, rotatePhoto, saveDraft } from "@/lib/photo-selection/store";
import { acceptedSelectionFiles, clientShareMessage } from "../_builder/panel";
import { prepareSelectionPhotos } from "../_builder/prepare";
import OccasionUpload from "./OccasionUpload";
import { rememberSelectionFolder } from "@/lib/photo-selection/originals";
import SelectionRules from "./SelectionRules";
import GalleryAccess from "./GalleryAccess";
import NexpicCanvas from "../_builder/NexpicCanvas";

const forwardButtonClass = "inline-flex items-center gap-2 rounded-xl bg-amber-700 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-amber-700/30 hover:bg-amber-600 disabled:opacity-50";

function StepIntro({ icon: Icon, title, step, count, children }) {
  return (
    <div className="-mx-6 -mt-6 mb-4 flex items-center gap-2.5 border-b border-[#ead8c8] bg-gradient-to-r from-[#fff8f3] to-[#fbf6f1] px-6 py-2.5">
      <div className="grid size-8 shrink-0 place-items-center rounded-full bg-[#f6e4cf] text-[#8f6834]"><Icon className="size-3.5" /></div>
      <div className="min-w-0 flex-1">
        <h2 className="truncate text-sm font-bold text-stone-900">{title}</h2>
        <p className="truncate text-[11px] leading-4 text-stone-500">{children}</p>
      </div>
      {count != null ? <span className="shrink-0 rounded-full border border-emerald-300 bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-800">{count} {count === 1 ? "photo" : "photos"} uploaded</span> : null}
      <span className="shrink-0 text-[10px] font-semibold tracking-[0.14em] text-[#b08968] uppercase">Step {step} of 5</span>
    </div>
  );
}

const STEPS = [
  { id: 1, name: "Client Details", subtitle: "Couple & event", icon: User },
  { id: 2, name: "Upload Photos", subtitle: "Folder & files", icon: UploadCloud },
  { id: 3, name: "Selection Rules", subtitle: "Limits & sheets", icon: Target },
  { id: 4, name: "Gallery Access", subtitle: "Share & code", icon: Shield },
  { id: 5, name: "Review & Publish", subtitle: "Final check", icon: Eye },
];

const emptyForm = {
  folderName: "", clientName: "", phone: "", whatsapp: "", clientEmail: "", eventDate: "", selectionDeadline: "", photographerNotes: "", welcomeMessage: "", originalFolderPath: "",
  selectionMode: "UNLIMITED", requiredPhotos: "", includedPhotos: "", allowExtraPhotos: true, strictLimit: false,
  maxSelectionLimit: "", photosPerSheet: 4, includedSheets: 25, enableExtraPhotoPricing: false, extraPhotoPrice: 50,
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

function comparableForm(source) {
  return {
    folderName: String(source.folderName || "").trim(),
    clientName: String(source.clientName || "").trim(),
    phone: phoneDigits(source.phone),
    whatsapp: phoneDigits(source.whatsapp),
    clientEmail: String(source.clientEmail || "").trim(),
    eventDate: source.eventDate || "",
    selectionDeadline: source.selectionDeadline || "",
    photographerNotes: String(source.photographerNotes || ""),
    welcomeMessage: String(source.welcomeMessage || ""),
    originalFolderPath: String(source.originalFolderPath || ""),
    selectionMode: source.selectionMode || "UNLIMITED",
    requiredPhotos: Number(source.requiredPhotos) || 0,
    includedPhotos: Number(source.includedPhotos) || 0,
    allowExtraPhotos: source.allowExtraPhotos !== false,
    strictLimit: Boolean(source.strictLimit),
    maxSelectionLimit: Number(source.maxSelectionLimit) || 0,
    photosPerSheet: Number(source.photosPerSheet) || 0,
    includedSheets: Number(source.includedSheets) || 0,
    enableExtraPhotoPricing: Boolean(source.enableExtraPhotoPricing),
    extraPhotoPrice: Number(source.extraPhotoPrice) || 0,
    enableExtraSheetPricing: Boolean(source.enableExtraSheetPricing),
    extraSheetPrice: Number(source.extraSheetPrice) || 0,
    accessCode: String(source.accessCode || ""),
  };
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
    selectionMode: album.selectionMode || album.rules?.selectionMode || "UNLIMITED",
    requiredPhotos: (album.selectionMode || album.rules?.selectionMode || "UNLIMITED") === "UNLIMITED" ? "" : (album.requiredPhotos ?? album.rules?.requiredPhotos ?? ""),
    includedPhotos: (album.selectionMode || album.rules?.selectionMode || "UNLIMITED") === "UNLIMITED" ? "" : (album.includedPhotos ?? album.rules?.includedPhotos ?? ""),
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
  const [folderName, setFolderName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingCode, setUpdatingCode] = useState(false);
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
  const savedForm = useRef(null);
  const savedMark = useRef(null);

  useEffect(() => {
    if (!user || markLoaded.current) return;
    markLoaded.current = true;
    setMarkOn(user.watermark_enabled !== false);
    setMarkText(user.watermark_text || "");
  }, [user]);

  useEffect(() => {
    if (!user || logoTouched.current) return;
    const url = user.watermark_logo_url || "";
    const enabled = user.watermark_enabled !== false;
    const text = user.watermark_text || "";
    setLogoUrl(url);
    setLogoPreview(user.watermark_logo_preview || "");
    setMarkLogo(Boolean(url) && user.watermark_include_logo !== false);
    if (!savedMark.current) {
      savedMark.current = {
        enabled,
        text: text.trim().slice(0, 120),
        include: Boolean(enabled && url && user.watermark_include_logo !== false),
        logo: url,
      };
    }
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
        setPhotoCount(album.photoCount || album.photos?.length || 0);
        setPhotos(album.photos || []);
        const nextForm = formFromAlbum(album);
        setFolderName(album.originalFolderPath || "");
        setStep(requestedStep >= 1 && requestedStep <= 5 ? requestedStep : Math.min(5, Math.max(1, album.wizardStep || 1)));
        setForm(nextForm);
        savedForm.current = comparableForm({ ...nextForm, accessCode: album.accessCode || "" });
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

  function rulesLimitError(source = form) {
    if (source.selectionMode === "FIXED") {
      if (source.requiredPhotos === "" || source.requiredPhotos == null || Number(source.requiredPhotos) <= 0) return "Enter the total photos required. Zero is not allowed.";
      if (photoCount > 0 && Number(source.requiredPhotos) > photoCount) return `Only ${photoCount} photos uploaded. The target cannot exceed ${photoCount}.`;
    }
    if (source.selectionMode === "MIN_EXTRA") {
      if (source.includedPhotos === "" || source.includedPhotos == null || Number(source.includedPhotos) <= 0) return "Enter the included photos. Zero is not allowed.";
      if (photoCount > 0 && Number(source.includedPhotos) > photoCount) return `Only ${photoCount} photos uploaded. The package limit cannot exceed ${photoCount}.`;
    }
    return "";
  }

  function patchForm(updates) {
    const next = { ...form, ...updates };
    setForm(next);
    if (!rulesLimitError(next)) setError("");
  }

  function payload(nextStep) {
    const count = (value) => {
      const number = Number(value);
      return number > 0 ? number : 1;
    };
    return { ...form, id: albumId || crypto.randomUUID(), wizardStep: nextStep, phone: phoneDigits(form.phone), whatsapp: phoneDigits(form.whatsapp), eventDate: form.eventDate || null, selectionDeadline: form.selectionDeadline || null, requiredPhotos: count(form.requiredPhotos), includedPhotos: count(form.includedPhotos), maxSelectionLimit: count(form.maxSelectionLimit || form.requiredPhotos) };
  }

  function currentMark() {
    return {
      enabled: markOn,
      text: markText.trim().slice(0, 120),
      include: Boolean(markOn && markLogo && logoUrl),
      logo: logoUrl,
    };
  }

  function formUnchanged() {
    if (!albumId || !savedForm.current) return false;
    return JSON.stringify(comparableForm({ ...form, accessCode })) === JSON.stringify(savedForm.current);
  }

  function rememberForm(nextForm = form, code = accessCode) {
    savedForm.current = comparableForm({ ...nextForm, accessCode: code });
  }

  function assertSavable(nextStep) {
    const body = payload(nextStep);
    if (body.phone && !/^[6-9]\d{9}$/.test(body.phone)) throw new Error("Enter a 10-digit mobile number starting with 6, 7, 8, or 9.");
    if (body.whatsapp && !/^[6-9]\d{9}$/.test(body.whatsapp)) throw new Error("Enter a 10-digit WhatsApp number starting with 6, 7, 8, or 9.");
    if (!String(body.folderName || "").trim() || !String(body.clientName || "").trim()) throw new Error("Couple name and client name are required.");
    if (nextStep >= 4) {
      const message = rulesLimitError();
      if (message) throw new Error(message);
    }
  }

  function openWatermark() {
    const message = rulesLimitError();
    if (message) {
      setError(message);
      toast.error(message);
      return;
    }
    setError("");
    setRulesPane("watermark");
  }

  async function persist(nextStep) {
    const body = payload(nextStep);
    if (/^\d{6}$/.test(accessCode)) body.accessCode = accessCode;
    assertSavable(nextStep);
    const album = albumId ? await saveDraft(albumId, body) : await createDraft(body);
    setAlbumId(album.id);
    const savedCode = album.accessCode || (/^\d{6}$/.test(accessCode) ? accessCode : "");
    setAccessCode(savedCode);
    rememberForm(form, savedCode);
    return album;
  }

  function advance(savedStep) {
    setStep(savedStep);
    if (albumId) router.replace(`${ROUTES.dashboardPhotoSelectionNew}?album=${albumId}&step=${savedStep}`);
  }

  function nextAccessCode(current) {
    let code = String(current || "");
    while (code === String(current || "")) code = String(Math.floor(100000 + Math.random() * 900000));
    return code;
  }

  async function updateShare() {
    if (!albumId) {
      setError("Save the gallery before updating the access code.");
      return;
    }
    const previous = accessCode;
    const stored = savedForm.current?.accessCode || "";
    const typed = String(previous || "").replace(/\D/g, "").slice(0, 6);
    const code = /^\d{6}$/.test(typed) && typed !== stored ? typed : nextAccessCode(stored || previous);
    setError("");
    setAccessCode(code);
    setUpdatingCode(true);
    try {
      const album = await saveDraft(albumId, { accessCode: code });
      const saved = album?.accessCode || code;
      setAccessCode(saved);
      rememberForm(form, saved);
      toast.success(`Access code ${saved} saved`);
    } catch (saveError) {
      setAccessCode(previous);
      setError(saveError.message || "Could not update the access code.");
      toast.error(saveError.message || "Could not update the access code.");
    } finally {
      setUpdatingCode(false);
    }
  }

  async function go(nextStep) {
    const savedStep = nextStep === "done" ? 2 : nextStep;
    setError("");
    try {
      assertSavable(savedStep);
      if (formUnchanged()) {
        advance(savedStep);
        return;
      }
      setSaving(true);
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
      if (!file.selectionRelativePath) file.selectionRelativePath = sourceRelativePath(file);
      file.selectionCategory = file.selectionCategory || category;
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
      setWork({ phase: "done", current: 1, total: 1 });
      await new Promise((resolve) => setTimeout(resolve, 400));
    } catch (uploadError) {
      setError(uploadError.message);
      return false;
    } finally {
      setWork(null);
    }
    return true;
  }

  async function rotateChosen(photo) {
    if (!albumId || !photo?.id) return;
    setError("");
    try {
      const saved = await rotatePhoto(albumId, photo.id);
      setPhotos((current) => current.map((item) => item.id === photo.id ? { ...item, rotation: saved.rotation } : item));
    } catch (rotateError) {
      setError(rotateError.message || "Could not rotate this photo.");
    }
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
    setError("");
    const mark = currentMark();
    const markSame = savedMark.current && JSON.stringify(mark) === JSON.stringify(savedMark.current);
    if (markSame && formUnchanged()) {
      advance(4);
      return;
    }
    setSaving(true);
    try {
      if (!markSame) {
        const result = await updateSocialLinks({
          watermark_enabled: markOn,
          watermark_text: markText.trim().slice(0, 120),
          watermark_position: user?.watermark_position || "bottom-right",
          watermark_opacity: Number(user?.watermark_opacity) || 0.45,
          watermark_include_logo: Boolean(markOn && markLogo && logoUrl),
          watermark_logo_url: logoUrl,
        });
        if (result.data?.user) applyUser(result.data.user);
        savedMark.current = mark;
      }
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
      if (!formUnchanged()) await persist(5);
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
      <div>
        <div className="mb-3 flex items-center justify-between gap-3 border-b border-stone-200 pb-3">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 text-white shadow-lg shadow-amber-600/30"><Sparkles className="size-5" /></div>
            <div>
              <h1 className="font-sans text-xl font-bold text-stone-900">{resumeId ? "Resume client gallery" : "Create New Client Gallery"}</h1>
              <p className="text-xs text-stone-500">Fill client and couple details and click Done. {albumId ? "You can upload photos and set rules right after." : "Creating the gallery uses one photo-selection credit."}</p>
            </div>
          </div>
          <Link href={ROUTES.dashboardPhotoSelection} className="rounded-xl p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-700" aria-label="Close"><X className="size-5" /></Link>
        </div>
        {resumeId || step > 1 ? <div className="mb-3 grid grid-cols-2 gap-3 md:grid-cols-5">
          {STEPS.map((item) => {
            const Icon = item.icon;
            const done = item.id < step;
            const active = item.id === step;
            return (
              <button key={item.id} type="button" disabled={item.id > step} onClick={() => done && setStep(item.id)} aria-label={done ? `Edit ${item.name}` : item.name} className={`flex items-center gap-2.5 rounded-2xl border px-3 py-2.5 text-left disabled:cursor-default ${active ? "border-amber-700 bg-amber-700 text-white" : done ? "cursor-pointer border-emerald-200 bg-emerald-50 text-emerald-800 hover:border-emerald-400" : "cursor-default border-stone-200 bg-white text-stone-400"}`}>
                <span className={`grid size-9 shrink-0 place-items-center rounded-full ${active ? "bg-white/20 text-white" : done ? "bg-white text-emerald-700" : "bg-stone-100 text-stone-400"}`}><Icon size={18} /></span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] leading-4 font-semibold">{item.name}</span>
                  <span className="mt-0.5 block text-[11px] leading-4 opacity-75">{item.subtitle}</span>
                </span>
                {done ? <span className="grid size-7 shrink-0 place-items-center rounded-full bg-white text-emerald-700 ring-1 ring-emerald-200"><Pencil className="size-3.5" /></span> : null}
              </button>
            );
          })}
        </div> : null}
        {error ? <p className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
        <div className="overflow-hidden rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm">
          {step === 1 ? <StepIntro icon={User} title="Couple & Client Details" step={1}>Fill client and couple contact details and click <strong>Done</strong>. {albumId ? "You can upload photos and set selection rules right after." : "Creating this gallery uses one photo-selection credit."}</StepIntro> : null}
          {step === 2 ? <StepIntro icon={UploadCloud} title="Upload Photographs & Folders" step={2} count={photos.length}>Upload photos or select entire ceremony folders. Subfolders are kept and filed under the active folder.</StepIntro> : null}
          {step === 3 ? <StepIntro icon={rulesPane === "watermark" ? Shield : Target} title={rulesPane === "watermark" ? "Watermark & Security Settings" : "Configure Photo Selection Mode"} step={3}>{rulesPane === "watermark" ? "Save the studio watermark that is drawn over client photos. It is not burned into the files." : "Choose how your client selects photos from their gallery."}</StepIntro> : null}
          {step === 4 ? <StepIntro icon={Shield} title="Share Client Photo Gallery" step={4}>Send the private gallery link, access code, and deadline to {form.clientName || "your client"}{form.folderName ? ` · ${form.folderName}` : ""}.</StepIntro> : null}
          {step === 5 ? <StepIntro icon={Eye} title="Review & Publish" step={5}>Check the gallery, then publish. Publishing opens the gallery for the client.</StepIntro> : null}
          {step === 1 ? (
            <div className="space-y-5">
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
                  <input type="date" min={localOffsetDate(0)} value={form.selectionDeadline} onChange={(event) => { const today = localOffsetDate(0); const value = event.target.value; if (value && value < today) { event.target.value = form.selectionDeadline && form.selectionDeadline >= today ? form.selectionDeadline : ""; return; } change("selectionDeadline", value); }} className="w-full cursor-pointer rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 text-xs outline-none focus:ring-2 focus:ring-amber-500" />
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
          {step === 2 ? <OccasionUpload photos={photos} disabled={Boolean(work) || !albumId} work={work} onUpload={uploadChosen} onRotate={rotateChosen} onRememberFolder={(handle) => rememberSelectionFolder(albumId, handle)} /> : null}
          {step === 3 ? (
            <div>
              <div className="mb-4 flex items-center justify-between border-b border-stone-200 pb-3">
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setRulesPane("rules")} className={`inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold ${rulesPane === "rules" ? "border border-amber-500/40 bg-amber-500/20 text-amber-800" : "bg-stone-100 text-stone-600"}`}><Target className="size-3.5 text-amber-600" />1. Selection Rules</button>
                  <span className="font-bold text-stone-300">➔</span>
                  <button type="button" onClick={openWatermark} className={`inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold ${rulesPane === "watermark" ? "border border-amber-500/40 bg-amber-500/20 text-amber-800" : "bg-stone-100 text-stone-600"}`}><Shield className="size-3.5 text-amber-600" />2. Watermark & Security</button>
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
                          {logoBusy ? <Loader2 className="size-3.5 animate-spin" /> : <UploadCloud className="size-3.5" />}{logoBusy ? "Uploading…" : "Upload logo"}
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
              updating={updatingCode}
              saving={saving}
              onCode={setAccessCode}
              onDeadline={(value) => { if (value && value < localOffsetDate(0)) return; change("selectionDeadline", value); }}
              onWelcome={(value) => change("welcomeMessage", value)}
              onUpdate={updateShare}
            />
          ) : null}
          {step === 5 ? (
            <div className="space-y-3">
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { icon: Heart, label: "Couple", value: form.folderName || "Not set" },
                  { icon: User, label: "Client", value: form.clientName || "Not set" },
                  { icon: Phone, label: "Mobile", value: phoneDigits(form.phone).length === 10 ? `+91 ${phoneDigits(form.phone).slice(0, 5)} ${phoneDigits(form.phone).slice(5)}` : "Not set" },
                  { icon: ImageIcon, label: "Photos", value: String(photoCount) },
                  { icon: Target, label: "Selection", value: form.selectionMode === "FIXED" ? `Fixed · ${form.requiredPhotos}` : form.selectionMode === "MIN_EXTRA" ? `Included ${form.includedPhotos}` : "Unlimited" },
                  { icon: Shield, label: "Access code", value: accessCode || "Created with the draft" },
                  { icon: Calendar, label: "Deadline", value: form.selectionDeadline || "Not set" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2.5 rounded-xl bg-[#fbf6f1] px-3 py-2">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white text-[#8f6834]"><item.icon className="size-3.5" /></span>
                    <span className="min-w-0">
                      <span className="block text-[10px] font-semibold tracking-[0.12em] text-[#b08968] uppercase">{item.label}</span>
                      <span className="block truncate text-sm font-semibold text-stone-800">{item.value}</span>
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-stone-500">Publishing opens this gallery for the client. The photo-selection credit was used when the gallery was created.</p>
              <div className="flex flex-wrap gap-1.5">
                {STEPS.filter((item) => item.id < 5).map((item) => (
                  <button key={item.id} type="button" onClick={() => setStep(item.id)} className="inline-flex items-center gap-1.5 rounded-full border border-[#ead8c8] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#6b5344] hover:border-[#c5a059]">
                    <Pencil className="size-3 text-[#b08968]" />{item.name}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          <div className="mt-6 flex items-center justify-between gap-3 border-t border-stone-200 pt-4">
            {step === 1 ? <Button variant="secondary" asChild><Link href={ROUTES.dashboardPhotoSelection}><ChevronLeft className="size-4" />Back</Link></Button> : step === 3 && rulesPane === "watermark" ? <button type="button" disabled={saving} onClick={() => setRulesPane("rules")} className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-stone-700">Back (Selection Rules)</button> : step === 3 ? <button type="button" disabled={saving} onClick={() => setStep(2)} className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-stone-700">Cancel</button> : <Button variant="secondary" disabled={saving || Boolean(work)} onClick={() => setStep((value) => value - 1)}><ChevronLeft className="size-4" />Back</Button>}
            <div className="flex gap-2">
              {step === 1 ? <button type="button" disabled={saving} onClick={() => go("done")} className={forwardButtonClass}>{saving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}{saving ? "Saving…" : "Done"}</button> : null}
              {step === 3 && rulesPane === "rules" ? <button type="button" disabled={saving} onClick={openWatermark} className={forwardButtonClass}>{saving ? <Loader2 className="size-4 animate-spin" /> : null}Next: Watermark & Security <ArrowRight className="size-3.5" /></button> : null}
              {step === 3 && rulesPane === "watermark" ? <button type="button" disabled={saving} onClick={saveWatermark} className={forwardButtonClass}>{saving ? <Loader2 className="size-4 animate-spin" /> : null}{saving ? "Saving…" : "Save watermark & continue"}</button> : null}
              {step > 1 && step < 5 && step !== 3 ? <button type="button" disabled={saving || updatingCode || Boolean(work) || (step === 2 && !albumId)} onClick={() => go(step + 1)} className={forwardButtonClass}>{(saving || work) ? <Loader2 className="size-4 animate-spin" /> : null}{saving || work ? "Saving…" : "Save & continue"}</button> : null}
              {step === 5 ? <button type="button" disabled={saving || !photoCount} onClick={publish} className={forwardButtonClass}>{saving ? <Loader2 className="size-4 animate-spin" /> : null}{saving ? "Publishing…" : "Publish gallery"}</button> : null}
            </div>
          </div>
        </div>
      </div>
      {published ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#fdf7f4]/60 p-4 backdrop-blur-[2px]">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-[#ead8c8] bg-white text-center shadow-[0_20px_50px_-24px_rgba(120,72,48,0.45)]">
            <Link href={ROUTES.dashboardPhotoSelection} aria-label="Close" className="absolute top-3 right-3 grid size-8 place-items-center rounded-full text-stone-400 hover:bg-stone-100 hover:text-stone-700"><X className="size-4" /></Link>
            <div className="bg-gradient-to-r from-[#fff8f3] to-[#fbf6f1] px-6 py-4">
              <span className="mx-auto grid size-9 place-items-center rounded-full bg-emerald-100 text-emerald-700"><Check className="size-4" /></span>
              <h2 className="mt-2 font-sans text-lg font-bold text-stone-900">Gallery published</h2>
            </div>
            <div className="px-6 py-4">
              <p className="break-all text-xs text-stone-500">{typeof window === "undefined" ? "" : `${window.location.origin}/photo-selection/${published.shareToken}`}</p>
              <p className="mt-2 font-mono text-xl tracking-[0.28em] text-stone-800">{published.accessCode}</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <button type="button" onClick={() => navigator.clipboard.writeText(`${window.location.origin}/photo-selection/${published.shareToken}`)} className={forwardButtonClass}>Copy link</button>
                <button type="button" onClick={() => { const phone = phoneDigits(form.whatsapp || form.phone); const link = `${window.location.origin}/photo-selection/${published.shareToken}`; const text = encodeURIComponent(clientShareMessage({ studioName: user?.studio_name, expiry: form.selectionDeadline, link, pin: published.accessCode, welcome: form.welcomeMessage })); window.open(phone ? `https://api.whatsapp.com/send?phone=91${phone}&text=${text}` : `https://api.whatsapp.com/send?text=${text}`, "_blank"); }} className="inline-flex items-center gap-1.5 rounded-xl border border-[#ead8c8] bg-white px-4 py-2.5 text-xs font-bold text-stone-700">WhatsApp</button>
                <Link href={ROUTES.dashboardPhotoSelectionView(published.id)} className="inline-flex items-center gap-1.5 rounded-xl border border-[#ead8c8] bg-white px-4 py-2.5 text-xs font-bold text-stone-700">Open gallery</Link>
              </div>
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
