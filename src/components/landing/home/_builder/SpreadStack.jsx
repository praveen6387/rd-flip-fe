const SPREADS = [
  { label: "Front cover", name: "Open", tone: "from-[#1c2430] to-[#4a5568]" },
  { label: "Inside pages", name: "Story", tone: "from-[#2a1810] to-[#7a4a28]" },
  { label: "Back cover", name: "Close", tone: "from-[#121018] to-[#3d2a55]" },
];

export default function SpreadStack() {
  return (
    <div className="relative mx-auto h-64 w-full max-w-sm">
      {SPREADS.map((spread, index) => (
        <div
          key={spread.name}
          className={`absolute left-0 right-0 h-40 overflow-hidden border border-white/15 bg-linear-to-br ${spread.tone} p-4`}
          style={{
            top: `${index * 36}px`,
            transform: `rotate(${(index - 1) * 3}deg)`,
            zIndex: index + 1,
          }}
        >
          <p className="text-[10px] tracking-[0.2em] text-white/50">{spread.label}</p>
          <p className="mt-8 font-heading text-xl text-white">{spread.name}</p>
        </div>
      ))}
    </div>
  );
}
