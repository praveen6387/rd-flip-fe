/**
 * QR card designs (layouts from reference images) + color themes.
 */

export const QR_DESIGNS = [
  {
    id: "share-love",
    label: "Share the Love",
    description: "Floral border card",
  },
  {
    id: "frosted",
    label: "Frosted",
    description: "Acrylic sign look",
  },
  {
    id: "share-shots",
    label: "Share Shots",
    description: "Camera + script",
  },
  {
    id: "capture-moment",
    label: "Capture Moment",
    description: "Eucalyptus header",
  },
  {
    id: "capture-love",
    label: "Capture Love",
    description: "Corner botanicals",
  },
];

export const QR_COLORS = [
  {
    id: "navy",
    label: "Navy",
    swatch: "#2f3a55",
    ink: "#2f3a55",
    muted: "#5c657a",
    accent: "floral",
    cardBg: "#ffffff",
    frostedBg: "#6d7a88",
    frostedInk: "#ffffff",
  },
  {
    id: "gold",
    label: "Gold",
    swatch: "#c4a35a",
    ink: "#c4a35a",
    muted: "#6b6358",
    accent: "eucalyptus",
    cardBg: "#ffffff",
    frostedBg: "#8a7a5c",
    frostedInk: "#ffffff",
  },
  {
    id: "sage",
    label: "Sage",
    swatch: "#556b48",
    ink: "#3f4a38",
    muted: "#6a7a60",
    accent: "sage",
    cardBg: "#f7faf4",
    frostedBg: "#6a7a68",
    frostedInk: "#ffffff",
  },
  {
    id: "rose",
    label: "Rose",
    swatch: "#a66d6d",
    ink: "#5c3d3d",
    muted: "#8a6a6a",
    accent: "blush",
    cardBg: "#fff8f7",
    frostedBg: "#8a6a6e",
    frostedInk: "#ffffff",
  },
  {
    id: "charcoal",
    label: "Charcoal",
    swatch: "#1f1f1f",
    ink: "#111111",
    muted: "#5a5a5a",
    accent: "eucalyptus",
    cardBg: "#ffffff",
    frostedBg: "#4a5560",
    frostedInk: "#ffffff",
  },
  {
    id: "mist",
    label: "Mist",
    swatch: "#6d7a88",
    ink: "#3d4a56",
    muted: "#6a7884",
    accent: "mist",
    cardBg: "#f4f6f8",
    frostedBg: "#6d7a88",
    frostedInk: "#ffffff",
  },
];

export const DEFAULT_QR_DESIGN_ID = QR_DESIGNS[0].id;
export const DEFAULT_QR_COLOR_ID = QR_COLORS[0].id;

export function getQrDesign(id) {
  return QR_DESIGNS.find((item) => item.id === id) || QR_DESIGNS[0];
}

export function getQrColor(id) {
  return QR_COLORS.find((item) => item.id === id) || QR_COLORS[0];
}
