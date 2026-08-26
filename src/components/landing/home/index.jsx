import Content from "./_builder/Content";
import HomeCarousel from "./_builder/HomeCarousel";

export default function HomeSection() {
  return (
    <section id="home" className="relative scroll-mt-24 overflow-hidden border-b border-slate-200/80">
      <HomeCarousel />
      <div className="pointer-events-none absolute inset-y-0 left-0 z-20 flex w-full items-center">
        <div className="pointer-events-auto mx-auto w-full max-w-6xl px-6 py-16 sm:px-10">
          <Content />
        </div>
      </div>
    </section>
  );
}
