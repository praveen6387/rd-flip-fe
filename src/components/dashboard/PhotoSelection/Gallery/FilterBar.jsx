"use client";
import { Folder, Heart, Search, Star } from "lucide-react";

export default function GalleryFilterBar({ categories, category, onCategory, subfolders = [], subfolder = "All", onSubfolder, status, onStatus, selectedCount, totalCount, starredCount, coverCount, query, onQuery }) {
  const tabs = [
    ["all", `All (${totalCount})`],
    ["selected", `Selected (${selectedCount})`],
    ["unselected", `Remaining (${Math.max(0, totalCount - selectedCount)})`],
  ];
  return (
    <div className="sticky top-0 z-20 border-b border-stone-200/80 bg-stone-50/95 px-3 py-3 backdrop-blur sm:px-6">
      <div className="mx-auto flex max-w-[1800px] flex-col gap-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-1.5 overflow-x-auto">
          <button type="button" onClick={() => { onCategory("All"); onSubfolder?.("All"); }} className={`rounded-full px-3.5 py-1.5 text-xs font-medium whitespace-nowrap ${category === "All" ? "bg-stone-900 text-white" : "border border-stone-200 bg-white text-stone-600"}`}>All folders</button>
          {categories.map((name) => <button key={name} type="button" onClick={() => { onCategory(name); onSubfolder?.("All"); }} className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium whitespace-nowrap ${category === name ? "bg-stone-900 text-white" : "border border-stone-200 bg-white text-stone-600"}`}><Folder className="size-3.5" />{name}</button>)}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative min-w-0 flex-1 sm:w-48">
            <Search className="absolute top-2.5 left-3 size-3.5 text-stone-400" />
            <input value={query} onChange={(event) => onQuery(event.target.value)} placeholder="Search filename..." className="w-full rounded-xl border border-stone-200 bg-white py-1.5 pr-3 pl-8 text-xs text-stone-900 outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
          <div className="flex rounded-xl border border-stone-300/40 bg-stone-200/60 p-1">
            {tabs.map(([value, label]) => <button key={value} type="button" onClick={() => onStatus(value)} className={`rounded-lg px-2.5 py-1 text-xs font-medium ${status === value ? "bg-white text-stone-900 shadow-sm" : "text-stone-600"}`}>{value === "selected" ? <Heart className="mr-1 inline size-3 fill-rose-500 text-rose-500" /> : null}{label}</button>)}
            {starredCount > 0 ? <button type="button" onClick={() => onStatus("starred")} className={`rounded-lg px-2.5 py-1 text-xs font-medium ${status === "starred" ? "bg-amber-400 text-stone-950" : "text-amber-700"}`}><Star className="mr-1 inline size-3 fill-amber-500" />Stars ({starredCount})</button> : null}
            {coverCount > 0 ? <button type="button" onClick={() => onStatus("covers")} className={`rounded-lg px-2.5 py-1 text-xs font-medium ${status === "covers" ? "bg-sky-500 text-white" : "text-sky-700"}`}>Covers ({coverCount})</button> : null}
          </div>
        </div>
        </div>
        {subfolders.length ? <div className="flex gap-1.5 overflow-x-auto"><button type="button" onClick={() => onSubfolder?.("All")} className={`rounded-full px-3 py-1 text-[11px] font-medium ${subfolder === "All" ? "bg-amber-700 text-white" : "bg-white text-stone-600"}`}>All subfolders</button>{subfolders.map((name) => <button key={name} type="button" onClick={() => onSubfolder?.(name)} className={`rounded-full px-3 py-1 text-[11px] font-medium whitespace-nowrap ${subfolder === name ? "bg-amber-700 text-white" : "bg-white text-stone-600"}`}>{name}</button>)}</div> : null}
      </div>
    </div>
  );
}
