import Content from "./_builder/Content";

export default function HomeSection() {
  return (
    <section id="home" className="scroll-mt-24 border-b border-white/10">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col justify-center px-6 py-20">
        <Content />
      </div>
    </section>
  );
}
