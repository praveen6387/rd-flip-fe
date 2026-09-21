export default function Grid({ isDark = false }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-[0.35] transition-opacity duration-500"
      style={{
        backgroundImage: isDark
          ? `
          linear-gradient(to right, rgba(196, 138, 158, 0.12) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(196, 138, 158, 0.12) 1px, transparent 1px)
        `
          : `
          linear-gradient(to right, rgba(99, 102, 241, 0.08) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(99, 102, 241, 0.08) 1px, transparent 1px)
        `,
        backgroundSize: "88px 88px",
      }}
    />
  );
}
