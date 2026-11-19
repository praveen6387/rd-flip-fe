"use client";

import { useRef, useState } from "react";
import { Check, Folder, FolderTree, Heart, Image as ImageIcon, Loader2, Pencil, Plus, RotateCw, UploadCloud, X } from "lucide-react";
import { sourceRelativePath } from "@/lib/photo-selection/folder";
import { rotationClass } from "../Gallery/rotation";
import SelectionProgress from "../_builder/SelectionProgress";

export const OCCASIONS = ["Pre-Wedding", "Engagement", "Tilak", "Haldi", "Mehndi", "Sangeet", "Wedding", "Reception", "Post-Wedding", "Anniversary", "Birthday", "Family & Guests", "Other Events"];

export function occasionRelativePath(file) {
  return sourceRelativePath(file);
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

export default function OccasionUpload({ photos = [], disabled = false, onUpload, onRotate, work = null }) {
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
  const [queue, setQueue] = useState([]);
  const [openQueue, setOpenQueue] = useState("");
  const saved = [...new Set(photos.map((photo) => photo.category).filter(Boolean))];
  const categories = [...OCCASIONS.filter((name) => !hidden.includes(name)), ...custom, ...saved.filter((name) => !OCCASIONS.includes(name) && !custom.includes(name))];
  const countOf = (name) => photos.filter((photo) => photo.category === name).length;
  const uploadedCount = categories.filter((name) => countOf(name) > 0).length;
  const folderPhotos = photos.filter((photo) => photo.category === active);
  const shown = folderPhotos.length ? folderPhotos : photos;
  const queueStructure = queue.reduce((structure, file) => {
    const parts = String(file.selectionRelativePath || file.name).split("/").filter(Boolean);
    const main = file.selectionCategory || active;
    const sub = parts.length > 1 ? parts.slice(0, -1).join(" / ") : "Photos";
    structure[main] = structure[main] || {};
    structure[main][sub] = structure[main][sub] || [];
    structure[main][sub].push(file);
    return structure;
  }, {});

  function dropQueued(match) {
    setQueue((current) => current.filter((file) => !match(file)));
  }

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

  function enqueue(fileList) {
    const files = [...fileList].filter((file) => file.type?.startsWith("image/") || /\.(jpe?g|png|webp)$/i.test(file.name));
    if (!files.length || disabled) return;
    setQueue((current) => {
      const seen = new Set(current.map((file) => file.selectionRelativePath || file.name));
      const next = [];
      for (const file of files) {
        const path = file.selectionRelativePath || occasionRelativePath(file);
        if (seen.has(path)) continue;
        file.selectionRelativePath = path;
        file.selectionCategory = active;
        seen.add(path);
        next.push(file);
      }
      return [...current, ...next];
    });
  }

  async function startUpload() {
    if (!queue.length || disabled) return;
    const started = await onUpload(queue, active);
    if (started === true) setQueue([]);
  }

  function send(fileList) {
    enqueue(fileList);
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
        <p className="mb-2.5 text-[11px] text-stone-500">Photos are filed under {active}. Each folder you add stays separate.</p>
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          <button type="button" disabled={disabled} onClick={() => folderRef.current?.click()} className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-white shadow-sm"><FolderTree className="size-4" />Browse Ceremony Folders</button>
          <button type="button" disabled={disabled} onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs font-semibold text-stone-800"><ImageIcon className="size-3.5 text-amber-600" />Select Photos</button>
        </div>
        <input ref={folderRef} className="hidden" type="file" multiple webkitdirectory="" directory="" disabled={disabled} onChange={(event) => { send(event.target.files); event.target.value = ""; }} />
        <input ref={fileRef} className="hidden" type="file" multiple accept="image/jpeg,image/png,image/webp" disabled={disabled} onChange={(event) => { send(event.target.files); event.target.value = ""; }} />
      </div>
      {queue.length ? (
        <div className="mt-5 space-y-3 border-t border-stone-100 pt-4">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 font-semibold text-stone-800"><Folder className="size-4 text-amber-600" />Queue: <strong>{queue.length}</strong> {queue.length === 1 ? "photo" : "photos"} ready for upload</span>
            <button type="button" disabled={disabled} onClick={() => setQueue([])} className="text-stone-400 hover:text-stone-600 disabled:opacity-40">Clear all</button>
          </div>
          <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-3">
            <span className="mb-2 block text-[11px] font-semibold tracking-wider text-stone-500 uppercase">Detected folder & subfolder structure:</span>
            <div className="space-y-2">
              {Object.entries(queueStructure).map(([folder, subs]) => (
                <div key={folder} className="text-xs">
                  <p className="flex items-center gap-1.5 font-semibold text-stone-800">
                    <Folder className="size-3.5 text-amber-600" />
                    {folder}
                    <button type="button" disabled={disabled} onClick={() => dropQueued((file) => (file.selectionCategory || active) === folder)} className="grid size-4 place-items-center rounded-full text-stone-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40" aria-label={`Remove ${folder}`}><X className="size-3" /></button>
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1 pl-5">
                    {Object.entries(subs).map(([sub, files]) => {
                      const groupKey = `${folder}/${sub}`;
                      const open = openQueue === groupKey;
                      return (
                        <div key={sub} className="max-w-full">
                          <span className="inline-flex items-center gap-1 rounded-md border border-stone-200 bg-white px-2 py-0.5 font-mono text-[11px] text-stone-700">
                            <button type="button" disabled={disabled} onClick={() => setOpenQueue(open ? "" : groupKey)} className="inline-flex items-center gap-1"><span className="text-stone-400">↳</span><strong>{sub}</strong>: {files.length} {files.length === 1 ? "photo" : "photos"}</button>
                            <button type="button" disabled={disabled} onClick={() => dropQueued((file) => files.includes(file))} className="grid size-4 place-items-center rounded-full text-stone-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40" aria-label={`Remove ${sub}`}><X className="size-3" /></button>
                          </span>
                          {open ? (
                            <span className="mt-1 flex flex-wrap gap-1">
                              {files.map((file) => (
                                <span key={file.selectionRelativePath || file.name} className="inline-flex max-w-full items-center gap-1 rounded-md border border-stone-200 bg-white px-1.5 py-0.5 text-[11px] text-stone-600">
                                  <span className="truncate">{file.name}</span>
                                  <button type="button" disabled={disabled} onClick={() => dropQueued((item) => item === file)} className="grid size-4 shrink-0 place-items-center rounded-full text-stone-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40" aria-label={`Remove ${file.name}`}><X className="size-3" /></button>
                                </span>
                              ))}
                            </span>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-end justify-between gap-3 pt-1 sm:flex-row sm:items-center">
            <p className="text-xs text-stone-500">Once upload finishes, continue to Selection Rules so you can share the link with the client.</p>
            <button type="button" disabled={disabled} onClick={startUpload} className="inline-flex items-center gap-2 rounded-xl bg-amber-700 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-amber-700/30 hover:bg-amber-600 disabled:opacity-50">{work ? <Loader2 className="size-4 animate-spin" /> : <UploadCloud className="size-4" />}{work ? "Uploading…" : `Start Upload (${queue.length} ${queue.length === 1 ? "Photo" : "Photos"})`}</button>
          </div>
          <SelectionProgress state={work} />
        </div>
      ) : null}
      <div className="mt-4">
        <h3 className="font-sans text-lg font-bold text-stone-900">Photo Gallery Manager ({shown.length})</h3>
        <p className="text-xs text-stone-500">{folderPhotos.length ? `Photos in ${active}` : "Uploaded photos from every folder"}</p>
        {shown.length ? (
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {shown.map((photo) => (
              <figure key={photo.id} className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
                <div className="relative aspect-[4/3] bg-stone-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.imageUrl} alt={photo.name} className={`size-full object-cover ${rotationClass(photo.rotation)}`} />
                  <button type="button" disabled={disabled} onClick={() => onRotate?.(photo)} className="absolute right-2 bottom-2 grid size-8 place-items-center rounded-full bg-stone-950/75 text-white disabled:opacity-40" aria-label={`Rotate ${photo.name}`}><RotateCw className="size-4" /></button>
                  {photo.selected ? <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-rose-600 px-2 py-0.5 text-[10px] font-bold text-white"><Heart className="size-3 fill-white" />Selected</span> : null}
                </div>
                <figcaption className="flex items-center justify-between gap-2 border-t border-stone-100 p-2 text-[11px]">
                  <span className="truncate font-mono text-stone-700" title={photo.name}>{photo.name}</span>
                  {photo.category || photo.subfolder ? <span className="shrink-0 rounded bg-stone-100 px-1.5 py-0.5 text-[10px] font-medium text-stone-500">{[photo.category, photo.subfolder].filter(Boolean).join(" / ")}</span> : null}
                </figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <div className="mt-3 rounded-2xl border border-stone-200 bg-white px-6 py-10 text-center">
            <ImageIcon className="mx-auto mb-2 size-10 text-stone-300" />
            <p className="text-sm font-semibold text-stone-700">No photos in this view</p>
            <p className="mt-0.5 text-xs text-stone-500">Upload photos above and they will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
