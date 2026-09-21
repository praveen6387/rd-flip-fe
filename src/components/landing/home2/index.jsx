import Image from "next/image";
import Content from "./_builder/Content";
import HeroVisual from "./_builder/HeroVisual";

export default function Home2Section() {
  return (
    <section
      id="home"
      className="relative scroll-mt-0 min-h-dvh overflow-hidden bg-[#07070f]"
    >
      <div className="absolute inset-0">
        <Image
          src="/v2/home/bg-home.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center brightness-[0.45] contrast-[1.05] saturate-[1.15]"
        />
        <div className="absolute inset-0 bg-linear-to-b from-[#07070f]/75 via-[#0b1020]/55 to-[#07070f]/90" />
        <div className="absolute inset-0 bg-linear-to-r from-[#07070f]/70 via-transparent to-[#07070f]/35" />
      </div>

      <div className="relative z-10 mx-auto grid min-h-dvh w-full max-w-7xl items-center gap-6 px-4 pt-[8rem] pb-8 sm:px-6 md:gap-8 md:pt-24 md:pb-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)] lg:gap-4 lg:pt-24 lg:pb-12 xl:gap-2">
        <Content />
        <div className="flex min-w-0 items-center justify-center lg:justify-end lg:pl-2">
          <HeroVisual />
        </div>
      </div>
    </section>
  );
}
