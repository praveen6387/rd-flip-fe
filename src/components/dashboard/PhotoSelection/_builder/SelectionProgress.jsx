import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function SelectionProgress({ state }) {
  if (!state || state.phase === "load") return null;
  const total = Math.max(Number(state.total) || 0, 1);
  const current = Math.min(Number(state.current) || 0, total);
  const ratio = current / total;
  const percent = state.phase === "done" ? 100 : state.phase === "save" ? 90 : state.phase === "upload" ? 35 + ratio * 50 : ratio * 35;
  const label = state.phase === "done"
    ? "Folder saved"
    : state.phase === "save"
      ? "Saving the folder"
      : state.phase === "optimize"
        ? `Preparing ${current} of ${state.total || total}`
        : `Uploading ${current} of ${state.total || total}`;

  return (
    <div className="w-full" role="status" aria-live="polite">
      <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-stone-600">
        <Loader2 className={`size-3.5 shrink-0 text-sky-600 ${state.phase === "done" ? "" : "animate-spin"}`} />
        {label}
      </p>
      <Progress value={percent} className="h-1" />
    </div>
  );
}
