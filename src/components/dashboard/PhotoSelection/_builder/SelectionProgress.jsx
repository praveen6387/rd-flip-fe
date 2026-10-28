import { Check, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import ViewportCenterOverlay from "@/components/dashboard/_builder/ViewportCenterOverlay";
import { cn } from "@/lib/cn";

const UPLOAD_STEPS = [
  { id: "upload", title: "Upload your photos", activeText: "Sending each photo safely" },
  { id: "save", title: "Save the folder", activeText: "Storing the photo links" },
];

function stepStatus(phase, id) {
  const order = UPLOAD_STEPS.map((step) => step.id);
  const current = order.indexOf(phase);
  const index = order.indexOf(id);
  if (current > index) return "done";
  if (current === index) return "active";
  return "wait";
}

function Card({ isDark, wide = false, children }) {
  return (
    <div
      className={cn(
        "w-full rounded-2xl border px-5 py-5 shadow-2xl sm:px-6",
        wide ? "max-w-md" : "max-w-sm",
        isDark
          ? "border-white/15 bg-slate-900/95 text-white"
          : "border-white/70 bg-white/95 text-slate-900"
      )}
    >
      {children}
    </div>
  );
}

export default function SelectionProgress({ state, isDark }) {
  if (!state || state.phase === "load") return null;
  const percent = Math.round((state.current / Math.max(state.total, 1)) * 100);

  if (state.phase === "optimize") {
    return (
      <ViewportCenterOverlay isDark={isDark}>
        <Card isDark={isDark}>
          <p className="text-[11px] font-medium tracking-[0.18em] text-sky-600 uppercase">
            Optimizing photos
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-tight">
            {state.current} of {state.total}
          </p>
          <p className={cn("mt-1 truncate text-sm", isDark ? "text-slate-300" : "text-slate-500")}>
            Optimizing {state.name}
          </p>
          <Progress value={percent} className="mt-4 h-1.5" />
        </Card>
      </ViewportCenterOverlay>
    );
  }

  return (
    <ViewportCenterOverlay isDark={isDark}>
      <Card isDark={isDark} wide>
        <p className="text-[11px] font-medium tracking-[0.18em] text-sky-600 uppercase">
          Uploading photos
        </p>
        <ol className="mt-5">
          {UPLOAD_STEPS.map((step, index) => {
            const status = stepStatus(state.phase, step.id);
            const last = index === UPLOAD_STEPS.length - 1;
            return (
              <li key={step.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span
                    className={cn(
                      "grid size-7 shrink-0 place-items-center rounded-full",
                      status === "done" && "bg-emerald-500 text-white",
                      status === "active" && (isDark ? "bg-sky-400/15 text-sky-300" : "bg-sky-50 text-sky-600"),
                      status === "wait" && (isDark ? "border border-white/15 text-slate-500" : "border border-slate-200 text-slate-300")
                    )}
                  >
                    {status === "done" ? (
                      <Check className="size-3.5" strokeWidth={2.5} />
                    ) : status === "active" ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <span className="size-1.5 rounded-full bg-current" />
                    )}
                  </span>
                  {last ? null : (
                    <span
                      className={cn(
                        "my-1 w-px flex-1",
                        status === "done" ? "bg-emerald-400/70" : isDark ? "bg-white/10" : "bg-slate-200"
                      )}
                    />
                  )}
                </div>
                <div className={cn("min-w-0 flex-1", last ? "pb-0" : "pb-5")}>
                  <p className={cn("text-[15px] font-semibold leading-7", status === "wait" && (isDark ? "text-slate-500" : "text-slate-400"))}>
                    {step.title}
                  </p>
                  {status === "active" ? (
                    <div className="mt-1">
                      <p className={cn("text-sm", isDark ? "text-slate-300" : "text-slate-500")}>
                        {step.id === "upload" ? `${state.current} of ${state.total} photos` : step.activeText}
                      </p>
                      {step.id === "upload" ? <Progress value={percent} className="mt-2.5 h-1.5" /> : null}
                    </div>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      </Card>
    </ViewportCenterOverlay>
  );
}
