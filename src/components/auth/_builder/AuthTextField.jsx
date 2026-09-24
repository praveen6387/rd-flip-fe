import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";

const pillInputClass =
  "auth-field-input h-13 rounded-full border-0 bg-transparent py-0 text-base leading-normal text-slate-900 shadow-none placeholder:text-slate-400 focus-visible:bg-transparent focus-visible:ring-0 md:text-base";

export function AuthPillField({
  icon: Icon,
  endAdornment,
  className,
  ...props
}) {
  return (
    <div className="rounded-full focus-within:bg-slate-50 focus-within:ring-2 focus-within:ring-blue-200">
      <div className="relative overflow-hidden rounded-full bg-slate-100">
        {Icon ? (
          <Icon className="pointer-events-none absolute top-1/2 left-4 z-10 size-4 -translate-y-1/2 text-slate-400" />
        ) : null}
        <Input
          className={cn(
            pillInputClass,
            Icon ? "pl-11" : "px-4",
            endAdornment ? "pr-11" : "pr-4",
            className
          )}
          {...props}
        />
        {endAdornment ? (
          <div className="absolute top-1/2 right-3 z-10 -translate-y-1/2">
            {endAdornment}
          </div>
        ) : null}
      </div>
    </div>
  );
}
