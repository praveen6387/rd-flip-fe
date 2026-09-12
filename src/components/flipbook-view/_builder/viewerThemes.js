export const VIEWER_THEME_KEY = "rd-flip-viewer-theme";

export const VIEWER_THEMES = [
  {
    id: "ocean",
    label: "Ocean Waves",
    description: "Deep sea swell",
    canvas: "ocean",
    layers: { stars: false, particles: false, glow: false },
  },
  {
    id: "river",
    label: "River Flow",
    description: "Soft river current",
    canvas: "river",
    layers: { stars: false, particles: false, glow: false },
  },
  {
    id: "night",
    label: "Night Sky",
    description: "Stars & twilight",
    canvas: "night",
    layers: { stars: true, particles: false, glow: false },
  },
  {
    id: "aurora",
    label: "Aurora",
    description: "Northern lights",
    canvas: "aurora",
    layers: { stars: true, particles: false, glow: false },
  },
  {
    id: "sunset",
    label: "Sunset Sea",
    description: "Warm golden waves",
    canvas: "sunset",
    layers: { stars: false, particles: true, glow: true },
  },
  {
    id: "glow",
    label: "Studio Glow",
    description: "Warm ambient light",
    canvas: null,
    layers: { stars: true, particles: true, glow: true },
  },
];

export const DEFAULT_VIEWER_THEME = "ocean";

export function getViewerTheme(id) {
  return (
    VIEWER_THEMES.find((theme) => theme.id === id) ||
    VIEWER_THEMES.find((theme) => theme.id === DEFAULT_VIEWER_THEME)
  );
}

export function readStoredViewerTheme() {
  if (typeof window === "undefined") return DEFAULT_VIEWER_THEME;
  try {
    const stored = window.localStorage.getItem(VIEWER_THEME_KEY);
    return getViewerTheme(stored)?.id || DEFAULT_VIEWER_THEME;
  } catch {
    return DEFAULT_VIEWER_THEME;
  }
}

export function storeViewerTheme(id) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(VIEWER_THEME_KEY, id);
  } catch {
    /* ignore quota / private mode */
  }
}
