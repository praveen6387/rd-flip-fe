"use client";

import { useRef, useState } from "react";
import { Check, Folder, FolderTree, Image as ImageIcon, Pencil, Plus, UploadCloud, X } from "lucide-react";

export const OCCASIONS = ["Pre-Wedding", "Engagement", "Tilak", "Haldi", "Mehndi", "Sangeet", "Wedding", "Reception", "Post-Wedding", "Anniversary", "Birthday", "Family & Guests", "Other Events"];

export function occasionRelativePath(file, category) {
  const raw = String(file.webkitRelativePath || file.relativePath || "").replace(/\\/g, "/");
  const parts = raw.split("/").filter((part) => part && part !== "." && part !== "..");
  const inner = parts.length > 1 ? parts.slice(1, -1) : [];
  const safeCategory = String(category || "Other Events").replace(/[\\/]/g, " ").trim() || "Other Events";
  return [safeCategory, ...inner, file.name].join("/");
}

async function scanEntry(entry, path = "") {
  if (entry.isFile) {
    return new Promise((resolve) => {
      entry.file((file) => {
        file.relativePath = path ? `${path}/${file.name}` : file.name;
        resolve([file]);
      }, () => resolve([]));
    });
  }
  if (!entry.isDirectory) return [];
  const reader = entry.createReader();
  const current = path ? `${path}/${entry.name}` : entry.name;
  const entries = await new Promise((resolve) => {
    const all = [];
    const read = () => {
      reader.readEntries((batch) => {
        if (!batch.length) resolve(all);
        else { all.push(...batch); read(); }
      }, () => resolve(all));
    };
    read();
  });
  const nested = await Promise.all(entries.map((child) => scanEntry(child, current)));
  return nested.flat();
}

export default function OccasionUpload({ photos = [], disabled = false, onUpload }) {
  const folderRef = useRef(null);
  const fileRef = useRef(null);
  const [active, setActive] = useState("Pre-Wedding");
  const [custom, setCustom] = useState([]);
  const [hidden, setHidden] = useState([]);
  const [adding, setAdding] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [editing, setEditing] = useState("");
  const [editName, setEditName] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const saved = [...new Set(photos.map((photo) => photo.category).filter(Boolean))];
  const categories = [...OCCASIONS.filter((name) => !hidden.includes(name)), ...custom, ...saved.filter((name) => !OCCASIONS.includes(name) && !custom.includes(name))];
  const countOf = (name) => photos.filter((photo) => photo.category === name).length;
  const uploadedCount = categories.filter((name) => countOf(name) > 0).length;

  function addCategory() {
    const name = draftName.trim();
    if (!name || categories.some((item) => item.toLowerCase() === name.toLowerCase())) {
      setAdding(false);
      setDraftName("");
      return;
    }
    setCustom((current) => [...current, name]);
    setActive(name);
    setAdding(false);
    setDraftName("");
  }

  function removeCategory(name) {
    if (countOf(name) > 0 || categories.length <= 1) return;
    setHidden((current) => [...current, name]);
    setCustom((current) => current.filter((item) => item !== name));
    if (active === name) setActive(categories.find((item) => item !== name) || "Wedding");
  }

  function renameCategory(name) {
    const next = editName.trim();
    if (!next || next === name || countOf(name) > 0) {
      setEditing("");
      return;
    }
    if (categories.some((item) => item !== name && item.toLowerCase() === next.toLowerCase())) return;
    setHidden((current) => [...current, name]);
    setCustom((current) => [...current.filter((item) => item !== name), next]);
    if (active === name) setActive(next);
    setEditing("");
  }

  function send(fileList) {
    const files = [...fileList];
    if (!files.length || disabled) return;
    onUpload(files, active);
  }

  async function dropFiles(event) {
    event.preventDefault();
    setDragOver(false);
    const items = [...(event.dataTransfer?.items || [])];
    const entries = items.map((item) => item.webkitGetAsEntry?.()).filter(Boolean);
    if (entries.length) {
      const scanned = (await Promise.all(entries.map((entry) => scanEntry(entry)))).flat();
      if (scanned.length) {
        send(scanned);
        return;
      }
    }
    send(event.dataTransfer?.files || []);
  }

  return (
    <div>
      <div className="mb-3">
        <h3 className="flex items-center gap-2 font-serif text-base font-bold text-stone-900"><UploadCloud className="size-4 text-amber-500" />Upload Photographs & Folders</h3>
        <p className="mt-0.5 text-xs text-stone-500">Upload photos or select entire folders with ceremonies (Pre-Wedding, Tilak, Haldi, Mehndi, Wedding, Reception). Subfolders are preserved automatically.</p>
      </div>
      <div className="mb-3 space-y-2 rounded-xl border border-stone-200/80 bg-stone-50 p-2.5">
        <div className="flex flex-wrap items-center justify-between gap-1.5">
          <span className="flex items-center gap-1.5 text-xs font-bold text-stone-800"><Folder className="size-3.5 text-amber-500" />Target Folder:{uploadedCount ? <span className="rounded-full border border-emerald-300 bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">{uploadedCount} uploaded ({photos.length} photos)</span> : null}</span>
          <span className="text-[11px] text-stone-500">Active: <strong className={countOf(active) ? "text-emerald-600" : "text-amber-600"}>{active}</strong></span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((name) => {
            const count = countOf(name);
            const selected = active === name;
            if (editing === name) {
              return (
                <div key={name} className="inline-flex items-center gap-1 rounded-xl border-2 border-amber-500 bg-white p-1">
                  <input autoFocus value={editName} onChange={(event) => setEditName(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") renameCategory(name); if (event.key === "Escape") setEditing(""); }} className="w-28 bg-transparent px-2 py-0.5 text-xs font-semibold outline-none" />
                  <button type="button" onClick={() => renameCategory(name)} className="rounded-lg bg-emerald-600 p-1 text-white"><Check className="size-3" /></button>
                  <button type="button" onClick={() => setEditing("")} className="rounded-lg bg-stone-200 p-1 text-stone-600"><X className="size-3" /></button>
                </div>
              );
            }
            return (
              <div key={name} className={`inline-flex items-center rounded-xl text-xs font-semibold ${selected ? (count ? "bg-emerald-600 text-white shadow-md" : "bg-amber-500 text-white shadow-md") : count ? "border-2 border-emerald-400 bg-emerald-50 text-emerald-800" : "border border-stone-200 bg-white text-stone-700"}`}>
                <button type="button" disabled={disabled} onClick={() => setActive(name)} className="inline-flex items-center gap-1.5 px-2.5 py-1">
                  {count ? <Check className="size-3" /> : selected ? <Folder className="size-3 fill-amber-200/40" /> : null}
                  {name}
                  {count ? <span className={`rounded-full px-1.5 font-mono text-[10px] font-bold ${selected ? "bg-emerald-700/80 text-white" : "bg-emerald-200 text-emerald-900"}`}>{count}</span> : null}
                </button>
                {!count ? <button type="button" onClick={() => { setEditing(name); setEditName(name); }} className="p-1 opacity-50 hover:opacity-100" aria-label={`Rename ${name}`}><Pencil className="size-2.5" /></button> : null}
                {!count && categories.length > 1 ? <button type="button" onClick={() => removeCategory(name)} className="mr-1 p-1 opacity-40 hover:text-rose-600 hover:opacity-100" aria-label={`Remove ${name}`}><X className="size-2.5" /></button> : null}
              </div>
            );
          })}
          {adding ? (
            <div className="inline-flex items-center gap-1 rounded-xl border-2 border-amber-500 bg-white p-1">
              <input autoFocus value={draftName} placeholder="Folder name..." onChange={(event) => setDraftName(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") addCategory(); if (event.key === "Escape") setAdding(false); }} className="w-32 bg-transparent px-2 py-0.5 text-xs outline-none" />
              <button type="button" onClick={addCategory} className="rounded-lg bg-emerald-600 p-1 text-white"><Check className="size-3.5" /></button>
              <button type="button" onClick={() => setAdding(false)} className="rounded-lg bg-stone-200 p-1 text-stone-600"><X className="size-3.5" /></button>
            </div>
          ) : (
            <button type="button" disabled={disabled} onClick={() => { setAdding(true); setDraftName(""); }} className="inline-flex items-center gap-1 rounded-xl border-2 border-dashed border-amber-400 bg-amber-50/50 px-2.5 py-1 text-xs font-bold text-amber-700"><Plus className="size-3" />Add Folder</button>
          )}
        </div>
      </div>
      <div
        onDragEnter={(event) => { event.preventDefault(); setDragOver(true); }}
        onDragOver={(event) => { event.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={dropFiles}
        className={`rounded-xl border-2 border-dashed p-5 text-center ${dragOver ? "border-amber-500 bg-amber-50" : "border-stone-200"}`}
      >
        <div className="mx-auto mb-1.5 grid size-8 place-items-center rounded-xl bg-amber-50 text-amber-600"><UploadCloud className="size-4" /></div>
        <p className="text-sm font-semibold text-stone-800">Drag & drop photos or entire ceremony folders here</p>
        <p className="mb-2.5 text-[11px] text-stone-500">Folder structure & subfolders are recognized and organized automatically into {active}.</p>
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          <button type="button" disabled={disabled} onClick={() => folderRef.current?.click()} className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-white shadow-sm"><FolderTree className="size-4" />Browse Ceremony Folders</button>
          <button type="button" disabled={disabled} onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs font-semibold text-stone-800"><ImageIcon className="size-3.5 text-amber-600" />Select Photos</button>
        </div>
        <input ref={folderRef} className="hidden" type="file" multiple webkitdirectory="" directory="" disabled={disabled} onChange={(event) => { send(event.target.files); event.target.value = ""; }} />
        <input ref={fileRef} className="hidden" type="file" multiple accept="image/jpeg,image/png,image/webp" disabled={disabled} onChange={(event) => { send(event.target.files); event.target.value = ""; }} />
      </div>
      <p className="mt-4 font-serif text-lg font-bold text-stone-900">Photo Gallery Manager ({photos.length})</p>
    </div>
  );
}
