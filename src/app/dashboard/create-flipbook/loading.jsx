export default function Loading() {
  return (
    <div className="grid min-h-[50dvh] place-items-center text-stone-700">
      <div className="flex flex-col items-center gap-3">
        <span className="size-9 animate-spin rounded-full border-2 border-stone-300 border-t-stone-700" />
        <p className="text-[11px] tracking-[0.16em] text-stone-500 uppercase">
          Opening create…
        </p>
      </div>
    </div>
  );
}
