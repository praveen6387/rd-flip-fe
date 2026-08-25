export default function Glows() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_at_top,rgba(20,80,70,0.35),transparent_70%)]" />
      <div className="absolute top-[18%] left-[12%] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(212,160,60,0.16),transparent_70%)] blur-2xl" />
      <div className="absolute top-[22%] right-[8%] h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(196,130,40,0.18),transparent_70%)] blur-2xl" />
    </div>
  );
}
