export default function Loading() {
  return (
    <div className="grid min-h-dvh place-items-center bg-[#07070a] text-white">
      <div className="flex flex-col items-center gap-3">
        <span className="size-9 animate-spin rounded-full border-2 border-amber-200/25 border-t-amber-300" />
        <p className="text-[11px] tracking-[0.18em] text-amber-100/75 uppercase">
          Loading album
        </p>
      </div>
    </div>
  );
}
