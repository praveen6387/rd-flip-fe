"use client";

import { useEffect, useRef } from "react";

const COLORS = [
  "rgba(251,113,133,",
  "rgba(244,114,182,",
  "rgba(192,132,252,",
  "rgba(129,140,248,",
];

export default function Particles({
  colors = COLORS,
  density = 16000,
  maxCount = 80,
  minAlpha = 0.3,
  maxAlpha = 0.7,
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let particles = [];
    let width = 0;
    let height = 0;
    let running = true;
    const palette = colors.length ? colors : COLORS;
    const alphaRange = Math.max(0.05, maxAlpha - minAlpha);

    const spawn = () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.8 + 0.5,
      speed: Math.random() * 0.28 + 0.08,
      alpha: Math.random() * alphaRange + minAlpha,
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

      const count = Math.round((width * height) / density);
      particles = Array.from(
        { length: Math.min(Math.max(count, 24), maxCount) },
        spawn
      );
    };

    const draw = () => {
      if (!running) return;
      ctx.clearRect(0, 0, width, height);

      if (!media.matches) {
        for (const particle of particles) {
          particle.y -= particle.speed;
          if (particle.y < -4) {
            particle.y = height + 4;
            particle.x = Math.random() * width;
          }

          ctx.beginPath();
          ctx.fillStyle = `${particle.color}${particle.alpha})`;
          ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
          ctx.fill();
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
  }, [colors, density, maxCount, minAlpha, maxAlpha]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 h-full w-full"
    />
  );
}
