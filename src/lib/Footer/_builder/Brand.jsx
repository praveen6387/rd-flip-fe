import Link from "next/link";
import BrandMark from "../../_builder/BrandMark";
import { sectionHref } from "../../TopHeader/_builder/links";

export default function Brand({ pathname }) {
  return (
    <Link href={sectionHref(pathname, "#home")}>
      <BrandMark />
    </Link>
  );
}
