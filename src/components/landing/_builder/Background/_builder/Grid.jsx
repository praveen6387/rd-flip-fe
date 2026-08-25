export default function Grid() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-[0.12]"
      style={{
        backgroundImage: `
          linear-gradient(to right, rgba(180, 140, 80, 0.35) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(180, 140, 80, 0.35) 1px, transparent 1px)
        `,
        backgroundSize: "96px 96px",
      }}
    />
  );
}
