"use client";

import { useEffect, useRef } from "react";

const COLORS = [
  "rgba(251,113,133,",
  "rgba(244,114,182,",
  "rgba(192,132,252,",
  "rgba(129,140,248,",
  "rgba(56,189,248,",
];

export default function Bubbles({
  colors = COLORS,
  count = 28,
  minSize = 10,
  maxSize = 42,
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let bubbles = [];
    let width = 0;
    let height = 0;
    const palette = colors.length ? colors : COLORS;
    const sizeRange = Math.max(1, maxSize - minSize);

    const spawn = (fromBottom = false) => ({
      x: Math.random() * width,
      y: fromBottom ? height + Math.random() * 80 : Math.random() * height,
      r: Math.random() * sizeRange + minSize,
      speed: Math.random() * 0.45 + 0.18,
      drift: (Math.random() - 0.5) * 0.35,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: Math.random() * 0.02 + 0.008,
      alpha: Math.random() * 0.22 + 0.12,
      color: palette[Math.floor(Math.random() * palette.length)],
    });

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      width = Math.max(rect.width, 1);
      height = Math.max(rect.height, 1);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const nextCount = Math.min(
        Math.max(count, 12),
        Math.round((width * height) / 90000) + count
      );
      bubbles = Array.from({ length: nextCount }, () => spawn(false));
    };

    const drawBubble = (bubble) => {
      const { x, y, r, alpha, color } = bubble;

      // Soft fill
      ctx.beginPath();
      ctx.fillStyle = `${color}${alpha * 0.35})`;
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();

      // Glass rim
      ctx.beginPath();
      ctx.strokeStyle = `${color}${Math.min(alpha + 0.25, 0.55)})`;
      ctx.lineWidth = Math.max(1, r * 0.06);
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.stroke();

      // Highlight arc (soap-bubble shine)
      ctx.beginPath();
      ctx.strokeStyle = `rgba(255,255,255,${Math.min(alpha + 0.2, 0.45)})`;
      ctx.lineWidth = Math.max(1.2, r * 0.08);
      ctx.arc(x - r * 0.2, y - r * 0.25, r * 0.55, -Math.PI * 0.9, -Math.PI * 0.25);
      ctx.stroke();

      // Small specular dot
      ctx.beginPath();
      ctx.fillStyle = `rgba(255,255,255,${Math.min(alpha + 0.15, 0.4)})`;
      ctx.arc(x - r * 0.35, y - r * 0.4, Math.max(1.2, r * 0.08), 0, Math.PI * 2);
      ctx.fill();
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      for (const bubble of bubbles) {
        if (!media.matches) {
          bubble.wobble += bubble.wobbleSpeed;
          bubble.y -= bubble.speed;
          bubble.x += bubble.drift + Math.sin(bubble.wobble) * 0.35;

          if (bubble.y < -bubble.r - 8) {
            Object.assign(bubble, spawn(true));
          }
          if (bubble.x < -bubble.r) bubble.x = width + bubble.r;
          if (bubble.x > width + bubble.r) bubble.x = -bubble.r;
        }

        drawBubble(bubble);
      }

      frame = requestAnimationFrame(draw);
    };

    resize();
    draw();

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, [colors, count, minSize, maxSize]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
