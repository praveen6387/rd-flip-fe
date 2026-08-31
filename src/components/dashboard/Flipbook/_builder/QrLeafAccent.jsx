/** Soft watercolor accents until custom PNGs are added. */

const PALETTES = {
  eucalyptus: ["#8fad7a", "#6f9460", "#a3c08d", "#7a9e6a", "#5f7f52"],
  floral: ["#7a3048", "#3d4a6b", "#c4a484", "#5c6b4a", "#2f3a55"],
  sage: ["#9caf88", "#7d9470", "#b8c9a6", "#6a815c", "#556b48"],
  blush: ["#d4a5a5", "#c48b8b", "#e8c4c4", "#a66d6d", "#8f5a5a"],
  mist: ["#7a8a9a", "#5c6b7a", "#9aa8b4", "#6e7d8c", "#4a5866"],
};

function colors(variant) {
  return PALETTES[variant] || PALETTES.eucalyptus;
}

export function QrLeafTop({ className, variant = "eucalyptus" }) {
  const [a, b, c, d, stroke] = colors(variant);

  return (
    <svg
      viewBox="0 0 320 90"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <g opacity="0.92">
        <path
          d="M28 72c18-28 42-44 68-48 8 14 6 32-4 48-22 4-44 8-64 0Z"
          fill={a}
          fillOpacity="0.55"
        />
        <path
          d="M72 58c22-26 48-38 74-36-2 16-12 30-28 42-16 2-32 2-46-6Z"
          fill={b}
          fillOpacity="0.5"
        />
        <path
          d="M118 48c20-22 44-30 66-26-4 14-16 26-32 34-14 0-26-2-34-8Z"
          fill={c}
          fillOpacity="0.65"
        />
        <path
          d="M160 42c18-18 40-24 60-18-6 12-18 22-34 28-12-2-22-4-26-10Z"
          fill={d}
          fillOpacity="0.55"
        />
        <path
          d="M202 48c22-20 48-28 72-22 2 14-8 30-26 40-18 0-34-6-46-18Z"
          fill={a}
          fillOpacity="0.5"
        />
        <path
          d="M248 58c20-22 44-32 66-28-4 16-18 30-36 40-14-2-26-4-30-12Z"
          fill={b}
          fillOpacity="0.45"
        />
        <circle cx="95" cy="42" r="7" fill={a} fillOpacity="0.35" />
        <circle cx="210" cy="36" r="6" fill={c} fillOpacity="0.4" />
        <circle cx="145" cy="30" r="5" fill={b} fillOpacity="0.35" />
        <path
          d="M40 78c40-8 90-14 140-12 48 2 90 10 120 22"
          stroke={stroke}
          strokeWidth="1.2"
          strokeOpacity="0.35"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

export function QrLeafBottom({ className, variant = "eucalyptus" }) {
  const [a, b, c, d] = colors(variant);

  return (
    <svg
      viewBox="0 0 160 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <g opacity="0.9">
        <path
          d="M80 8c-4 10-2 22 6 32 10-6 16-16 14-28-6-4-14-6-20-4Z"
          fill={a}
          fillOpacity="0.55"
        />
        <path
          d="M68 18c-10 8-14 20-10 32 12-2 22-10 26-22-4-6-10-10-16-10Z"
          fill={b}
          fillOpacity="0.5"
        />
        <path
          d="M92 18c10 8 14 20 10 32-12-2-22-10-26-22 4-6 10-10 16-10Z"
          fill={c}
          fillOpacity="0.6"
        />
        <path
          d="M54 28c-12 6-18 18-14 28 10 0 18-8 22-18-2-4-4-8-8-10Z"
          fill={d}
          fillOpacity="0.45"
        />
        <path
          d="M106 28c12 6 18 18 14 28-10 0-18-8-22-18 2-4 4-8 8-10Z"
          fill={d}
          fillOpacity="0.45"
        />
      </g>
    </svg>
  );
}

export function QrCornerBranch({ className, variant = "eucalyptus", flip }) {
  const [a, b, c, d] = colors(variant);

  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={flip ? { transform: "scale(-1,-1)" } : undefined}
      aria-hidden
    >
      <path
        d="M8 112c18-28 36-52 58-68"
        stroke={d}
        strokeWidth="1.4"
        strokeOpacity="0.45"
        strokeLinecap="round"
      />
      <path
        d="M22 96c10-16 14-28 12-40 8 6 14 16 16 28-8 6-18 10-28 12Z"
        fill={a}
        fillOpacity="0.55"
      />
      <path
        d="M40 78c10-14 18-24 20-36 8 8 10 18 8 28-8 4-18 6-28 8Z"
        fill={b}
        fillOpacity="0.5"
      />
      <path
        d="M58 58c8-12 16-20 22-30 6 8 6 18 2 26-8 2-16 4-24 4Z"
        fill={c}
        fillOpacity="0.55"
      />
      <path
        d="M72 42c8-10 14-18 18-26 6 6 6 14 2 22-6 2-12 4-20 4Z"
        fill={a}
        fillOpacity="0.45"
      />
    </svg>
  );
}

export function QrCameraIcon({ className, color = "#111111" }) {
  return (
    <svg
      viewBox="0 0 64 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <rect
        x="4"
        y="12"
        width="48"
        height="30"
        rx="4"
        stroke={color}
        strokeWidth="1.6"
      />
      <path
        d="M16 12l4-6h12l4 6"
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="28" cy="27" r="8" stroke={color} strokeWidth="1.6" />
      <path
        d="M28 23.5c1.2 0 2.2.7 2.6 1.7"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M48 8l4-4M52 12l4-2M54 6l2 3"
        stroke={color}
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <path
        d="M12 8c-1.5-2-1-4 1-4M8 10c-2-1-2.5-3-.5-4"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
