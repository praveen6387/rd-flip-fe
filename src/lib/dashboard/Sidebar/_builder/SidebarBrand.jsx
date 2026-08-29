import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import BrandMark from "@/lib/_builder/BrandMark";

export default function SidebarBrand() {
  return (
    <Link
      href={ROUTES.home}
      className="block border-b border-slate-200/80 px-3 py-4"
    >
      <BrandMark />
    </Link>
  );
}
