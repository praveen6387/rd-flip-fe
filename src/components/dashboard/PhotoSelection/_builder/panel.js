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

export function selectionStage(album) {
  if (album.status === "selected") return "Locked";
  if (album.status === "pending" && album.rules?.confirmedByName) return "Unlocked";
  if (album.status === "draft" || !album.photoCount) return "Draft";
  if (album.selectedCount > 0) return "InProgress";
  return "Uploaded";
}

export function selectionStatus(album) {
  const stage = selectionStage(album);
  if (stage === "Locked") return { label: "Confirmed & Locked", hint: `${album.selectedCount} of ${album.photoCount} photos confirmed` };
  if (stage === "Unlocked") return { label: "Reopened • Unlocked", hint: "Reopened so the client can change the selection" };
  if (stage === "InProgress") return { label: "Selection In Progress", hint: `${album.selectedCount} of ${album.photoCount} photos selected` };
  if (stage === "Uploaded") return { label: "Uploaded", hint: "Shared and waiting for the client" };
  return { label: "Draft", hint: "Resume setup to finish this gallery" };
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

export function clientShareMessage({ studioName, expiry, link, pin, welcome }) {
  const [year, month, day] = String(expiry || "").split("-").map(Number);
  const expiryLabel = year && month && day
    ? new Date(year, month - 1, day).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "No expiry date";
  const lines = [studioName || "Studio", "", `Expiry date: ${expiryLabel}`, "", link, `PIN: ${pin || ""}`];
  const note = String(welcome || "").trim();
  if (note) lines.push("", note);
  return lines.join("\n");
}
