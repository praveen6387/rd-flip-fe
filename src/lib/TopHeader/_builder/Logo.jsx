import Link from "next/link";
import BrandMark from "../../_builder/BrandMark";
import { sectionHref } from "./links";

export default function Logo({ pathname, light = false }) {
  return (
    <Link href={sectionHref(pathname, "#home")} className="flex shrink-0">
      <BrandMark
        light={light}
        className="[&>span:first-child]:max-md:size-9 [&>span:nth-child(2)]:max-md:ml-2 [&>span:nth-child(2)>span:first-child]:max-md:text-base [&>span:nth-child(2)>span:last-child]:max-md:hidden"
      />
    </Link>
  );
}
