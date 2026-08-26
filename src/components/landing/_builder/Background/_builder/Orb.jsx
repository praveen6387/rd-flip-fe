"use client";

import { useEffect, useRef } from "react";

const COUNT = 3;
const MIN_RADIUS = 5;
const MAX_RADIUS = 8;
const STROKES = [
  "rgba(244, 114, 182,",
  "rgba(129, 140, 248,",
  "rgba(192, 132, 252,",
];

function createOrb(width, height, spawnAnywhere = true) {
  return {
    x: Math.random() * width,
    y: spawnAnywhere ? Math.random() * height : height + 12,
    r: MIN_RADIUS + Math.random() * (MAX_RADIUS - MIN_RADIUS),
    speed: 0.08 + Math.random() * 0.14,
    alpha: 0.35 + Math.random() * 0.35,
    color: STROKES[Math.floor(Math.random() * STROKES.length)],
  };
}

export default function Orb() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let orbs = [];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      orbs = Array.from({ length: COUNT }, () =>
        createOrb(window.innerWidth, window.innerHeight, true),
      );
    };

    const draw = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      for (const orb of orbs) {
        if (!media.matches) {
          orb.y -= orb.speed;
          if (orb.y + orb.r < -8) {
            Object.assign(orb, createOrb(window.innerWidth, window.innerHeight, true));
          }
        }

        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2);
        ctx.strokeStyle = `${orb.color}${orb.alpha})`;
        ctx.lineWidth = 1.25;
        ctx.shadowColor = `${orb.color}0.35)`;
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.shadowBlur = 0;
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
