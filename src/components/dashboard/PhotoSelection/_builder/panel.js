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
