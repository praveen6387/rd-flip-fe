import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import BrandMark from "@/lib/_builder/BrandMark";
import { cn } from "@/lib/cn";

export default function SidebarBrand({ className, compactCloseSpace = false }) {
  return (
    <Link
      href={ROUTES.home}
      className={cn(
        "block border-b border-white/10 px-4 py-5 transition hover:bg-white/8",
        compactCloseSpace && "pr-14",
        className
      )}
    >
      <BrandMark light />
    </Link>
  );
}
