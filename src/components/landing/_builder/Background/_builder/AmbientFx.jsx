"use client";

import { useEffect, useRef } from "react";

const PARTICLE_COLORS = [
  "rgba(251,113,133,",
  "rgba(244,114,182,",
  "rgba(192,132,252,",
  "rgba(129,140,248,",
];

const BUBBLE_COLORS = [
  "rgba(251,113,133,",
  "rgba(192,132,252,",
  "rgba(56,189,248,",
];

/** One canvas for particles + bubbles — smoother than two rAF loops. */
export default function AmbientFx({
  particleCount = 48,
  bubbleCount = 10,
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let width = 0;
    let height = 0;
    let frame = 0;
    let running = true;
    let last = 0;
    const FRAME_MS = 1000 / 30; // cap FX at ~30fps

    let particles = [];
    let bubbles = [];

    const spawnParticle = () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.6 + 0.4,
      speed: Math.random() * 0.26 + 0.08,
      alpha: Math.random() * 0.35 + 0.25,
      color: PARTICLE_COLORS[(Math.random() * PARTICLE_COLORS.length) | 0],
    });

    const spawnBubble = (fromBottom = false) => ({
      x: Math.random() * width,
      y: fromBottom ? height + 40 : Math.random() * height,
      r: Math.random() * 8 + 5,
      speed: Math.random() * 0.3 + 0.12,
      drift: (Math.random() - 0.5) * 0.22,
      wobble: Math.random() * Math.PI * 2,
      alpha: Math.random() * 0.16 + 0.1,
      color: BUBBLE_COLORS[(Math.random() * BUBBLE_COLORS.length) | 0],
    });

    const resize = () => {
      // dpr 1 keeps canvas cheap; browser scales CSS size
      width = Math.max(window.innerWidth, 1);
      height = Math.max(window.innerHeight, 1);
      canvas.width = width;
      canvas.height = height;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);

      particles = Array.from({ length: particleCount }, spawnParticle);
      bubbles = Array.from({ length: bubbleCount }, () => spawnBubble(false));
    };

    const draw = (now) => {
      if (!running) return;
      frame = requestAnimationFrame(draw);

      if (reduceMotion.matches) return;
      if (now - last < FRAME_MS) return;
      last = now;

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y -= p.speed;
        if (p.y < -4) {
          p.y = height + 4;
          p.x = Math.random() * width;
        }
        ctx.beginPath();
        ctx.fillStyle = `${p.color}${p.alpha})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      for (let i = 0; i < bubbles.length; i++) {
        const b = bubbles[i];
        b.wobble += 0.01;
        b.y -= b.speed;
        b.x += b.drift + Math.sin(b.wobble) * 0.22;
        if (b.y < -b.r - 8) Object.assign(b, spawnBubble(true));
        if (b.x < -b.r) b.x = width + b.r;
        if (b.x > width + b.r) b.x = -b.r;

        ctx.beginPath();
        ctx.fillStyle = `${b.color}${b.alpha * 0.28})`;
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.strokeStyle = `${b.color}${Math.min(b.alpha + 0.18, 0.4)})`;
        ctx.lineWidth = 1;
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.stroke();
      }
    };

    const onVisibility = () => {
      running = document.visibilityState === "visible";
      if (running) {
        last = 0;
        frame = requestAnimationFrame(draw);
      } else {
        cancelAnimationFrame(frame);
      }
    };

    resize();
    frame = requestAnimationFrame(draw);
    window.addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [particleCount, bubbleCount]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[1] h-full w-full"
    />
  );
}
