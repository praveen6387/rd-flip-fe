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
  count = 14,
  minSize = 5,
  maxSize = 14,
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let bubbles = [];
    let width = 0;
    let height = 0;
    let running = true;
    const palette = colors.length ? colors : COLORS;
    const sizeRange = Math.max(1, maxSize - minSize);

    const spawn = (fromBottom = false) => ({
      x: Math.random() * width,
      y: fromBottom ? height + Math.random() * 60 : Math.random() * height,
      r: Math.random() * sizeRange + minSize,
      speed: Math.random() * 0.35 + 0.14,
      drift: (Math.random() - 0.5) * 0.28,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: Math.random() * 0.015 + 0.006,
      alpha: Math.random() * 0.18 + 0.1,
      color: palette[Math.floor(Math.random() * palette.length)],
    });

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = Math.max(window.innerWidth, 1);
      height = Math.max(window.innerHeight, 1);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      bubbles = Array.from({ length: count }, () => spawn(false));
    };

    const drawBubble = (bubble) => {
      const { x, y, r, alpha, color } = bubble;

      ctx.beginPath();
      ctx.fillStyle = `${color}${alpha * 0.3})`;
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.strokeStyle = `${color}${Math.min(alpha + 0.2, 0.45)})`;
      ctx.lineWidth = Math.max(1, r * 0.07);
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.strokeStyle = `rgba(255,255,255,${Math.min(alpha + 0.15, 0.35)})`;
      ctx.lineWidth = Math.max(1, r * 0.07);
      ctx.arc(x - r * 0.2, y - r * 0.25, r * 0.5, -Math.PI * 0.9, -Math.PI * 0.25);
      ctx.stroke();
    };

    const draw = () => {
      if (!running) return;
      ctx.clearRect(0, 0, width, height);

      if (!media.matches) {
        for (const bubble of bubbles) {
          bubble.wobble += bubble.wobbleSpeed;
          bubble.y -= bubble.speed;
          bubble.x += bubble.drift + Math.sin(bubble.wobble) * 0.28;

          if (bubble.y < -bubble.r - 8) Object.assign(bubble, spawn(true));
          if (bubble.x < -bubble.r) bubble.x = width + bubble.r;
          if (bubble.x > width + bubble.r) bubble.x = -bubble.r;

          drawBubble(bubble);
        }
      }

      frame = requestAnimationFrame(draw);
    };

    const onVisibility = () => {
      running = document.visibilityState === "visible";
      if (running) frame = requestAnimationFrame(draw);
      else cancelAnimationFrame(frame);
    };

    resize();
    draw();

    window.addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [colors, count, minSize, maxSize]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 h-full w-full"
    />
  );
}
