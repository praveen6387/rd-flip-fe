import BrandMark from "@/lib/_builder/BrandMark";
import { cn } from "@/lib/cn";

export default function SidebarBrand({
  className,
  compactCloseSpace = false,
  collapsed = false,
  edgeToggle = false,
}) {
  return (
    <div
      className={cn(
        "relative flex h-[4.75rem] items-center border-b border-white/10",
        className
      )}
    >
      <div
        className={cn(
          "flex h-full min-w-0 flex-1 items-center overflow-hidden pl-[18px]",
          compactCloseSpace && "pr-14",
          edgeToggle && !collapsed && "pr-14"
        )}
      >
        <BrandMark light compact={collapsed} />
      </div>
    </div>
  );
}
