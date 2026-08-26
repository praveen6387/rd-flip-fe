import Image from "next/image";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  GALLERY_FLIPBOOKS,
  GALLERY_IMAGES,
  getFlipbookHref,
} from "./items";

function MediaTile({ src, alt, className, children, href }) {
  const inner = (
    <>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 50vw, 25vw"
        className="object-cover transition duration-500 group-hover:scale-[1.03]"
      />
      {children}
    </>
  );

  const shell = cn(
    "group relative block overflow-hidden rounded-xl bg-slate-100 shadow-sm",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={shell}>
        {inner}
      </Link>
    );
  }

  return <div className={shell}>{inner}</div>;
}

function SectionLabel({ children }) {
  return (
    <p className="mb-3 text-xs font-semibold tracking-[0.18em] text-slate-400 uppercase">
      {children}
    </p>
  );
}

export default function Content() {
  return (
    <div>
      <div className="max-w-xl">
        <p className="text-sm font-medium uppercase tracking-[0.22em] text-indigo-600 sm:text-base">
          Gallery
        </p>
        <h2 className="mt-3 font-heading text-3xl leading-tight text-slate-900 sm:text-4xl">
          Flipbooks & frames
        </h2>
        <p className="mt-3 text-base text-slate-500 sm:text-lg">
          Half live flipbooks, half still images — click a flipbook to open it.
        </p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2 lg:gap-6">
        {/* Flipbooks — add entries in items.js → GALLERY_FLIPBOOKS */}
        <div>
          <SectionLabel>Flipbooks</SectionLabel>
          <div className="grid auto-rows-[130px] grid-cols-2 gap-2.5 sm:auto-rows-[150px] md:gap-3">
            {GALLERY_FLIPBOOKS.map((item, index) => (
              <MediaTile
                key={item.id}
                src={item.src}
                alt={item.alt}
                href={getFlipbookHref(item.flipbookId)}
                className={index === 0 ? "row-span-2" : undefined}
              >
                <span className="absolute top-2.5 left-2.5 z-10 inline-flex items-center gap-1 rounded-full bg-slate-900/70 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-white uppercase backdrop-blur-sm">
                  <BookOpen className="size-3" strokeWidth={2.5} />
                  Flipbook
                </span>
              </MediaTile>
            ))}
          </div>
        </div>

        {/* Images — add entries in items.js → GALLERY_IMAGES */}
        <div>
          <SectionLabel>Images</SectionLabel>
          <div className="grid auto-rows-[130px] grid-cols-2 gap-2.5 sm:auto-rows-[150px] md:gap-3">
            {GALLERY_IMAGES.map((item, index) => (
              <MediaTile
                key={item.id}
                src={item.src}
                alt={item.alt}
                className={index === 0 ? "row-span-2" : undefined}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
