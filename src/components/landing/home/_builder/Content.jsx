import Link from "next/link";
import { ArrowRight, Images } from "lucide-react";

export default function Content() {
  return (
    <div className="max-w-3xl">
      {/* <p className="text-sm font-medium tracking-[0.22em] text-indigo-600 uppercase sm:text-base">
        Dashboard · covers · share
      </p> */}
      <h1 className="mt-5 font-heading text-5xl leading-[1.1] text-slate-900 sm:text-6xl lg:text-7xl">
        Build the flipbook.
        <span className="mt-2 block font-sans text-2xl font-normal tracking-tight text-slate-700 sm:text-3xl">
          Hand the client a link or a QR.
        </span>
      </h1>
      <p className="mt-6 max-w-xl text-lg leading-8 text-slate-700 sm:text-xl sm:leading-9">
        We create professionally designed digital flipbooks from wedding images,
        perfect for viewing and sharing anytime.
      </p>
      <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <Link
          href="#how-it-works"
          className="group inline-flex items-center gap-2 rounded-full border border-slate-700/30 bg-slate-700/10 px-8 py-4 text-base font-semibold text-slate-700 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-slate-700 hover:text-white hover:shadow-2xl"
        >
          See how you create
          <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
        </Link>
        <Link
          href="#gallery"
          className="group inline-flex items-center gap-2 rounded-full border-2 border-slate-700 bg-white/20 px-8 py-4 text-base font-semibold text-slate-700 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-slate-700 hover:text-white"
        >
          Gallery
          <Images className="size-5 transition-transform group-hover:scale-110" />
        </Link>
      </div>
    </div>
  );
}
