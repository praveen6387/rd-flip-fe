import { cn } from "@/lib/cn";

export default function NexpicCanvas({ children, bleed = false, className }) {
  return <div className={cn("nexpic-canvas", bleed && "nexpic-canvas-bleed", className)}>{children}</div>;
}
