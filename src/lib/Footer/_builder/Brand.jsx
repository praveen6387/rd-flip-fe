import Link from "next/link";
import { Camera } from "lucide-react";
import { sectionHref } from "../../TopHeader/_builder/links";

export default function Brand({ pathname }) {
  return (
    <Link
      href={sectionHref(pathname, "#home")}
      className="inline-flex items-center gap-3"
    >
      <span className="grid size-11 place-items-center rounded-xl bg-linear-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/25">
        <Camera className="size-5" strokeWidth={2.25} />
      </span>
      <span className="text-lg font-semibold tracking-tight text-white">
        RD Flip
      </span>
    </Link>
  );
}
