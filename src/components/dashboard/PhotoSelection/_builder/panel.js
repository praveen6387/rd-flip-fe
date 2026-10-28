import { cn } from "@/lib/cn";

export function selectionPanel(isDark, className) {
  return cn(
    "rounded-[1.6rem] border backdrop-blur-xl",
    isDark
      ? "border-white/10 bg-white/8"
      : "border-white/50 bg-white/25 shadow-[0_8px_32px_-24px_rgba(80,90,140,0.4)]",
    className
  );
}

export function selectionStatus(album) {
  if (album.status === "selected") {
    return { label: "Selected", hint: `${album.selectedCount} of ${album.photoCount} photos selected` };
  }
  if (album.status === "draft") {
    return { label: "Draft", hint: "Finish the upload to share this folder" };
  }
  return { label: "Waiting for client", hint: "Shared with the client" };
}

export function selectionStatusClass(status, isDark) {
  if (status === "selected") return isDark ? "bg-emerald-400/15 text-emerald-200" : "bg-emerald-50 text-emerald-700";
  if (status === "draft") return isDark ? "bg-amber-400/15 text-amber-200" : "bg-amber-50 text-amber-800";
  return isDark ? "bg-sky-400/15 text-sky-200" : "bg-sky-50 text-sky-700";
}

export function formatSelectionDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const ACCEPTED = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export function acceptedSelectionFiles(fileList) {
  const files = Array.from(fileList || []);
  const accepted = [];
  const rejected = [];
  files.forEach((file) => {
    if (ACCEPTED.includes(file.type)) accepted.push(file);
    else rejected.push(file);
  });
  return { accepted, rejected };
}
