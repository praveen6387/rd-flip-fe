"use client";

import { useEffect, useRef } from "react";

const COLORS = [
  "rgba(255,255,255,",
  "rgba(232,201,90,",
  "rgba(186,214,255,",
  "rgba(255,170,120,",
];

export default function Particles() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let particles = [];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.round((window.innerWidth * window.innerHeight) / 18000);
      particles = Array.from({ length: Math.min(Math.max(count, 40), 110) }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: Math.random() * 1.3 + 0.25,
        speed: Math.random() * 0.22 + 0.06,
        alpha: Math.random() * 0.45 + 0.12,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      for (const particle of particles) {
        if (!media.matches) {
          particle.y -= particle.speed;
          if (particle.y < -4) {
            particle.y = window.innerHeight + 4;
            particle.x = Math.random() * window.innerWidth;
          }
        }

        ctx.beginPath();
        ctx.fillStyle = `${particle.color}${particle.alpha})`;
        ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
        ctx.fill();
      }

      frame = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
