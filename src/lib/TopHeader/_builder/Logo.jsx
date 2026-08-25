import Link from "next/link";
import BrandMark from "../../_builder/BrandMark";
import { sectionHref } from "./links";

export default function Logo({ pathname }) {
  return (
    <Link href={sectionHref(pathname, "#home")} className="flex shrink-0">
      <BrandMark />
    </Link>
  );
}
