export function AuthOrb({ className }) {
  return (
    <span
      aria-hidden
      className={`absolute rounded-full bg-linear-to-br from-sky-300/80 via-blue-500 to-indigo-700 shadow-[inset_-8px_-10px_24px_rgba(15,23,42,0.35),inset_6px_8px_18px_rgba(255,255,255,0.35)] ${className}`}
    />
  );
}

export default function AuthPanel({ title, body }) {
  return (
    <div className="relative hidden overflow-hidden bg-linear-to-br from-blue-600 via-blue-700 to-indigo-800 p-8 text-white md:flex md:flex-col md:justify-center md:p-10">
      <AuthOrb className="-top-16 -left-10 size-56 opacity-90" />
      <AuthOrb className="top-1/3 -right-8 size-28 opacity-80" />
      <AuthOrb className="-bottom-10 left-10 size-36 opacity-75" />
      <AuthOrb className="right-10 bottom-16 size-16 opacity-70" />

      <div className="relative z-10 max-w-[16rem]">
        <h2 className="text-3xl font-bold tracking-[0.08em] uppercase">{title}</h2>
        <p className="mt-4 text-sm leading-6 text-white/85">{body}</p>
      </div>
    </div>
  );
}
