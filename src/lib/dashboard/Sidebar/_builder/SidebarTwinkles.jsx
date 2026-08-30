"use client";

import Particles from "@/components/landing/_builder/Background/_builder/Particles";

const COLORS = [
  "rgba(255,255,255,",
  "rgba(125,211,252,",
  "rgba(253,164,175,",
];

export default function SidebarTwinkles() {
  return <Particles colors={COLORS} density={12000} />;
}
