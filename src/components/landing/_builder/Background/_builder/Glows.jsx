export default function Glows() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute top-10 right-16 h-40 w-40 rounded-full bg-linear-to-br from-indigo-100 to-sky-100 opacity-70 blur-3xl" />
      <div className="absolute bottom-16 left-12 h-36 w-36 rounded-full bg-linear-to-br from-emerald-100 to-teal-100 opacity-70 blur-3xl" />
      <div className="absolute top-1/3 left-1/4 h-28 w-28 rounded-full bg-linear-to-br from-rose-100 to-pink-100 opacity-60 blur-2xl" />
      <div className="absolute top-[18%] left-[10%] h-[380px] w-[380px] rounded-full bg-[radial-gradient(circle,rgba(251,191,36,0.18),transparent_70%)] blur-2xl" />
      <div className="absolute bottom-[18%] right-[8%] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(244,114,182,0.16),transparent_70%)] blur-2xl" />
    </div>
  );
}
