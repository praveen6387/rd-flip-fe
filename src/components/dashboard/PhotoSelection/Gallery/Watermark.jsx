"use client";

const PLACE = {
  "bottom-right": "bottom-3 right-3",
  "bottom-left": "bottom-3 left-3",
  "top-right": "top-12 right-3",
  "top-left": "top-12 left-3",
  center: "inset-0 grid place-items-center",
};

export default function Watermark({ watermark, large = false }) {
  if (!watermark?.enabled || !watermark.text) return null;
  const opacity = Number(watermark.opacity) || 0.45;
  if (watermark.position === "diagonal") {
    return (
      <div className="pointer-events-none absolute inset-0 z-10 flex rotate-[-25deg] scale-125 flex-col justify-around overflow-hidden select-none" style={{ opacity }}>
        {[0, 1, 2].map((row) => <div key={row} className={`flex justify-around font-serif font-bold tracking-widest text-white drop-shadow ${large ? "text-lg" : "text-[10px]"}`}><span>{watermark.text}</span><span>{watermark.text}</span></div>)}
      </div>
    );
  }
  return (
    <div className={`pointer-events-none absolute z-10 select-none ${PLACE[watermark.position] || PLACE["bottom-right"]}`} style={{ opacity }}>
      <span className={`font-serif font-bold tracking-widest text-white drop-shadow ${large ? "text-2xl" : "text-[10px]"}`}>{watermark.text}</span>
    </div>
  );
}
