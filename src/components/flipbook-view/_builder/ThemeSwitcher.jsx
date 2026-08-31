"use client";

const THEMES = [
  { id: "studio", label: "Studio" },
  { id: "classic", label: "Classic" },
];

export default function ThemeSwitcher({ theme, onChange }) {
  return (
    <div
      className="inline-flex items-center rounded-full border border-amber-200/25 bg-black/35 p-0.5 backdrop-blur-sm"
      role="group"
      aria-label="Flipbook theme"
    >
      {THEMES.map((item) => {
        const active = theme === item.id;
        return (
          <button
            key={item.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(item.id)}
            className={`rounded-full px-2.5 py-1 text-[10px] tracking-[0.14em] uppercase transition sm:px-3 sm:text-[11px] ${
              active
                ? "bg-amber-100 text-[#1a140c]"
                : "text-amber-100/70 hover:text-amber-50"
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

export { THEMES };
