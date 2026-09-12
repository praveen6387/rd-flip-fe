"use client";

import { useEffect, useRef } from "react";
import { getViewerTheme } from "./viewerThemes";

const VERT = `
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

/* u_mode: 0 ocean, 1 river, 2 night, 3 aurora, 4 sunset */
const FRAG = `
precision highp float;

uniform vec2 u_res;
uniform float u_time;
uniform float u_mode;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = m * p;
    a *= 0.5;
  }
  return v;
}

vec3 oceanColor(vec2 p, float t) {
  vec2 q = p * 2.4;
  q.x += t * 0.12;
  q += vec2(
    fbm(q + vec2(0.0, t * 0.55)),
    fbm(q + vec2(4.1, -t * 0.4))
  ) * 0.65;

  float n1 = fbm(q * 1.2 + vec2(t * 0.28, -t * 0.18));
  float n2 = fbm(q * 2.6 - vec2(t * 0.4, t * 0.15));
  float surface = n1 * 0.65 + n2 * 0.35;

  float swell = smoothstep(0.35, 0.72, surface);
  float crest = smoothstep(0.62, 0.88, surface);
  float depth = smoothstep(0.1, 0.9, 1.0 - surface);

  vec3 deep = vec3(0.02, 0.08, 0.16);
  vec3 mid = vec3(0.05, 0.22, 0.38);
  vec3 light = vec3(0.18, 0.48, 0.62);
  vec3 foam = vec3(0.72, 0.88, 0.95);

  vec3 col = mix(deep, mid, depth);
  col = mix(col, light, swell * 0.7);
  col = mix(col, foam, crest * 0.55);
  col += vec3(0.08, 0.15, 0.2) * sin(surface * 8.0 + t) * 0.25;
  return col;
}

vec3 riverColor(vec2 p, float t) {
  vec2 q = p * vec2(1.6, 2.8);
  q.y += t * 0.22;
  q.x += sin(q.y * 1.8 + t * 0.6) * 0.18;
  q += fbm(q + t * 0.15) * 0.45;

  float flow = fbm(q * 1.5 + vec2(t * 0.35, 0.0));
  float ripple = fbm(q * 3.2 - vec2(0.0, t * 0.5));
  float surface = flow * 0.7 + ripple * 0.3;

  float band = smoothstep(0.3, 0.75, surface);
  float sparkle = smoothstep(0.7, 0.92, surface);

  vec3 deep = vec3(0.03, 0.12, 0.1);
  vec3 mid = vec3(0.08, 0.28, 0.24);
  vec3 light = vec3(0.22, 0.48, 0.4);
  vec3 glint = vec3(0.7, 0.88, 0.8);

  vec3 col = mix(deep, mid, surface);
  col = mix(col, light, band * 0.65);
  col = mix(col, glint, sparkle * 0.45);
  return col;
}

vec3 nightColor(vec2 p, float t) {
  float y = p.y * 0.5 + 0.5;
  vec3 zenith = vec3(0.02, 0.04, 0.12);
  vec3 horizon = vec3(0.08, 0.06, 0.14);
  vec3 col = mix(horizon, zenith, smoothstep(-0.2, 0.85, y));

  float milky = fbm(p * 1.8 + vec2(t * 0.02, 0.0));
  col += vec3(0.12, 0.14, 0.22) * smoothstep(0.45, 0.85, milky) * 0.35;

  float nebula = fbm(p * 0.9 + vec2(-t * 0.015, t * 0.01));
  col += vec3(0.18, 0.08, 0.22) * smoothstep(0.55, 0.9, nebula) * 0.22;
  return col;
}

vec3 auroraColor(vec2 p, float t) {
  vec3 sky = nightColor(p, t);
  float x = p.x;
  float curtain =
    sin(x * 2.2 + t * 0.35) * 0.5 +
    sin(x * 4.1 - t * 0.55) * 0.3 +
    fbm(vec2(x * 1.5, t * 0.2)) * 0.4;

  float height = smoothstep(0.55, -0.05, p.y);
  float band = smoothstep(0.15, 0.7, curtain + 0.35) * height;
  float edge = smoothstep(0.35, 0.85, curtain) * height;

  sky += vec3(0.05, 0.45, 0.28) * band * 0.85;
  sky += vec3(0.15, 0.35, 0.7) * edge * 0.45;
  sky += vec3(0.55, 0.25, 0.55) * band * edge * 0.25;
  return sky;
}

vec3 sunsetColor(vec2 p, float t) {
  vec2 q = p * 2.2;
  q.x += t * 0.1;
  q += vec2(
    fbm(q + vec2(t * 0.4, 0.0)),
    fbm(q + vec2(3.0, -t * 0.3))
  ) * 0.55;

  float n = fbm(q * 1.35 + t * 0.2);
  float m = fbm(q * 2.5 - t * 0.25);
  float surface = n * 0.7 + m * 0.3;
  float swell = smoothstep(0.35, 0.75, surface);
  float crest = smoothstep(0.65, 0.9, surface);

  float skyMix = smoothstep(-0.4, 0.7, p.y);
  vec3 waterDeep = vec3(0.08, 0.05, 0.12);
  vec3 waterMid = vec3(0.28, 0.12, 0.1);
  vec3 waterLight = vec3(0.55, 0.28, 0.12);
  vec3 gold = vec3(0.95, 0.7, 0.35);

  vec3 col = mix(waterDeep, waterMid, surface);
  col = mix(col, waterLight, swell * 0.7);
  col = mix(col, gold, crest * 0.5);
  col = mix(col, vec3(0.35, 0.12, 0.18), skyMix * 0.35);
  return col;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  float aspect = u_res.x / max(u_res.y, 1.0);
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0);
  float t = u_time;

  vec3 col;
  if (u_mode < 0.5) col = oceanColor(p, t);
  else if (u_mode < 1.5) col = riverColor(p, t);
  else if (u_mode < 2.5) col = nightColor(p, t);
  else if (u_mode < 3.5) col = auroraColor(p, t);
  else col = sunsetColor(p, t);

  // Soft center dim so album stays readable, edges stay vivid
  float vig = smoothstep(1.25, 0.2, length(p * vec2(0.75, 1.0)));
  col *= 0.72 + 0.28 * vig;

  float alpha = 0.92;
  if (u_mode > 1.5 && u_mode < 3.5) alpha = 0.98;

  gl_FragColor = vec4(col, alpha);
}
`;

const MODE_BY_CANVAS = {
  ocean: 0,
  river: 1,
  night: 2,
  aurora: 3,
  sunset: 4,
};

const STARS = Array.from({ length: 56 }, (_, i) => {
  const seed = (i * 97 + 13) % 1000;
  return {
    id: i,
    left: `${(seed * 17 + i * 7) % 100}%`,
    top: `${(seed * 31 + i * 11) % 92}%`,
    size: 1 + (i % 3),
    delay: `${(i % 12) * 0.45}s`,
    duration: `${2.2 + (i % 7) * 0.4}s`,
  };
});

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: `${(i * 17 + 7) % 100}%`,
  delay: `${(i % 9) * 0.55}s`,
  duration: `${9 + (i % 5) * 1.4}s`,
}));

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl) {
  const vs = createShader(gl, gl.VERTEX_SHADER, VERT);
  const fs = createShader(gl, gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return null;

  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

/** Decorative backdrop — pointer-events none, behind the book. */
export default function ViewerBackdrop({ themeId = "ocean" }) {
  const canvasRef = useRef(null);
  const modeRef = useRef(0);
  const theme = getViewerTheme(themeId);
  const canvasMode = theme.canvas;

  useEffect(() => {
    modeRef.current = MODE_BY_CANVAS[canvasMode] ?? -1;
  }, [canvasMode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canvasMode) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const still = reduced.matches;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: true,
      powerPreference: "low-power",
    });
    if (!gl) return;

    const program = createProgram(gl);
    if (!program) return;

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );

    const aPos = gl.getAttribLocation(program, "a_pos");
    const uRes = gl.getUniformLocation(program, "u_res");
    const uTime = gl.getUniformLocation(program, "u_time");
    const uMode = gl.getUniformLocation(program, "u_mode");

    gl.useProgram(program);
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    let raf = 0;
    let visible = document.visibilityState !== "hidden";
    const start = performance.now();

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      const pw = Math.max(1, Math.floor(w * dpr));
      const ph = Math.max(1, Math.floor(h * dpr));
      if (canvas.width !== pw || canvas.height !== ph) {
        canvas.width = pw;
        canvas.height = ph;
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
        gl.viewport(0, 0, pw, ph);
      }
    };

    const paint = (now) => {
      resize();
      const t = still ? 0 : (now - start) / 1000;
      const mode = modeRef.current;
      if (mode < 0) return;
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, t);
      gl.uniform1f(uMode, mode);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    const draw = (now) => {
      if (!visible || still) {
        raf = 0;
        if (still) paint(now);
        return;
      }
      paint(now);
      raf = requestAnimationFrame(draw);
    };

    const onVisibility = () => {
      visible = document.visibilityState !== "hidden";
      if (visible && !raf && !still) raf = requestAnimationFrame(draw);
    };

    resize();
    if (still) paint(performance.now());
    else raf = requestAnimationFrame(draw);

    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    };
  }, [canvasMode]);

  const { layers } = theme;

  return (
    <div
      className={`viewer-backdrop viewer-backdrop--${theme.id}`}
      aria-hidden="true"
      style={{ pointerEvents: "none" }}
    >
      <div className="viewer-backdrop__base" />
      {layers.glow ? (
        <>
          <div className="viewer-backdrop__glow viewer-backdrop__glow--a" />
          <div className="viewer-backdrop__glow viewer-backdrop__glow--b" />
          <div className="viewer-backdrop__glow viewer-backdrop__glow--c" />
        </>
      ) : null}
      {canvasMode ? (
        <canvas ref={canvasRef} className="viewer-backdrop__canvas" />
      ) : null}
      {layers.stars ? (
        <div className="viewer-backdrop__stars">
          {STARS.map((star) => (
            <span
              key={star.id}
              className="viewer-backdrop__star"
              style={{
                left: star.left,
                top: star.top,
                width: star.size,
                height: star.size,
                animationDelay: star.delay,
                animationDuration: star.duration,
              }}
            />
          ))}
        </div>
      ) : null}
      {layers.particles ? (
        <div className="viewer-backdrop__particles">
          {PARTICLES.map((p) => (
            <span
              key={p.id}
              className="viewer-backdrop__dot"
              style={{
                left: p.left,
                animationDelay: p.delay,
                animationDuration: p.duration,
              }}
            />
          ))}
        </div>
      ) : null}
      <div className="viewer-backdrop__veil" />
    </div>
  );
}
