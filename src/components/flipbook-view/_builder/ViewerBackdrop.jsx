"use client";

/** Decorative backdrop only — pointer-events none, behind the book. */
export default function ViewerBackdrop() {
  return (
    <div
      className="viewer-backdrop"
      aria-hidden="true"
      style={{ pointerEvents: "none" }}
    >
      <div className="viewer-backdrop__glow viewer-backdrop__glow--a" />
      <div className="viewer-backdrop__glow viewer-backdrop__glow--b" />
      <div className="viewer-backdrop__glow viewer-backdrop__glow--c" />
      <div className="viewer-backdrop__particles">
        {Array.from({ length: 18 }, (_, i) => (
          <span
            key={i}
            className="viewer-backdrop__dot"
            style={{
              left: `${(i * 17 + 7) % 100}%`,
              animationDelay: `${(i % 9) * 0.55}s`,
              animationDuration: `${9 + (i % 5) * 1.4}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
