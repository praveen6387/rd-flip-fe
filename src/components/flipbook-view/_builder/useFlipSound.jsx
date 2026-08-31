"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

const MUTE_KEY = "rd-flip-viewer-muted";

const FlipSoundContext = createContext({
  muted: false,
  toggleMute: () => {},
  playFlipSound: () => {},
  startBackgroundSong: () => {},
  stopBackgroundSong: () => {},
});

function createAudioContext() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  return new AudioCtx();
}

/** One consistent flip tone every page turn. */
function playFlipTone(ctx) {
  const now = ctx.currentTime;
  const duration = 0.14;

  const master = ctx.createGain();
  master.gain.setValueAtTime(0.0001, now);
  master.gain.exponentialRampToValueAtTime(0.16, now + 0.012);
  master.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  master.connect(ctx.destination);

  const osc = ctx.createOscillator();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(210, now);
  osc.frequency.exponentialRampToValueAtTime(150, now + duration);
  osc.connect(master);
  osc.start(now);
  osc.stop(now + duration + 0.02);

  const noiseLen = Math.floor(ctx.sampleRate * 0.05);
  const buffer = ctx.createBuffer(1, noiseLen, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < noiseLen; i += 1) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / noiseLen);
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = "bandpass";
  noiseFilter.frequency.value = 1100;
  noiseFilter.Q.value = 0.8;
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.045, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noise.start(now);
  noise.stop(now + 0.07);
}

/**
 * Original Bollywood-inspired loops (not copies of film songs).
 * Scale rooted on Sa≈C — romantic / shaadi vibe phrases.
 */
const SA = 261.63;
const RE = 293.66;
const GA = 329.63;
const MA = 349.23;
const PA = 392.0;
const DHA = 440.0;
const NI = 493.88;
const SA2 = 523.25;
const RE2 = 587.33;
const GA2 = 659.25;
const MA2 = 698.46;
const PA2 = 783.99;

const SONGS = [
  {
    // soft romantic shaadi waltz
    loop: 8.0,
    pad: [SA, PA],
    notes: [
      { f: SA2, t: 0.0, d: 0.55 },
      { f: NI, t: 0.6, d: 0.35 },
      { f: DHA, t: 1.0, d: 0.45 },
      { f: PA, t: 1.55, d: 0.5 },
      { f: MA, t: 2.2, d: 0.4 },
      { f: PA, t: 2.7, d: 0.4 },
      { f: DHA, t: 3.2, d: 0.55 },
      { f: SA2, t: 3.9, d: 0.7 },
      { f: RE2, t: 4.8, d: 0.45 },
      { f: SA2, t: 5.4, d: 0.4 },
      { f: NI, t: 5.95, d: 0.4 },
      { f: DHA, t: 6.5, d: 1.1 },
    ],
  },
  {
    // playful celebration
    loop: 7.2,
    pad: [SA, GA],
    notes: [
      { f: PA, t: 0.0, d: 0.28 },
      { f: DHA, t: 0.32, d: 0.28 },
      { f: NI, t: 0.64, d: 0.28 },
      { f: SA2, t: 0.96, d: 0.5 },
      { f: GA2, t: 1.6, d: 0.35 },
      { f: RE2, t: 2.05, d: 0.35 },
      { f: SA2, t: 2.5, d: 0.45 },
      { f: NI, t: 3.1, d: 0.3 },
      { f: DHA, t: 3.5, d: 0.3 },
      { f: PA, t: 3.9, d: 0.45 },
      { f: DHA, t: 4.5, d: 0.35 },
      { f: SA2, t: 5.0, d: 0.35 },
      { f: RE2, t: 5.5, d: 1.2 },
    ],
  },
  {
    // warm desi romance
    loop: 8.4,
    pad: [RE * 0.5, SA],
    notes: [
      { f: GA, t: 0.0, d: 0.5 },
      { f: MA, t: 0.55, d: 0.45 },
      { f: PA, t: 1.1, d: 0.6 },
      { f: DHA, t: 1.9, d: 0.5 },
      { f: SA2, t: 2.55, d: 0.7 },
      { f: NI, t: 3.4, d: 0.4 },
      { f: DHA, t: 3.95, d: 0.45 },
      { f: PA, t: 4.55, d: 0.55 },
      { f: MA, t: 5.3, d: 0.4 },
      { f: GA, t: 5.85, d: 0.4 },
      { f: RE, t: 6.4, d: 0.45 },
      { f: SA, t: 7.0, d: 1.0 },
    ],
  },
  {
    // night sangeet sparkle
    loop: 6.8,
    pad: [PA * 0.5, DHA * 0.5],
    notes: [
      { f: SA2, t: 0.0, d: 0.3 },
      { f: RE2, t: 0.35, d: 0.3 },
      { f: GA2, t: 0.7, d: 0.45 },
      { f: MA2, t: 1.3, d: 0.35 },
      { f: GA2, t: 1.75, d: 0.35 },
      { f: RE2, t: 2.2, d: 0.4 },
      { f: SA2, t: 2.75, d: 0.5 },
      { f: PA, t: 3.4, d: 0.35 },
      { f: DHA, t: 3.85, d: 0.35 },
      { f: NI, t: 4.3, d: 0.35 },
      { f: SA2, t: 4.75, d: 0.4 },
      { f: GA2, t: 5.3, d: 1.1 },
    ],
  },
  {
    // classic filmi rise
    loop: 7.6,
    pad: [SA, MA],
    notes: [
      { f: SA, t: 0.0, d: 0.4 },
      { f: RE, t: 0.45, d: 0.35 },
      { f: GA, t: 0.9, d: 0.35 },
      { f: MA, t: 1.35, d: 0.45 },
      { f: PA, t: 1.95, d: 0.55 },
      { f: DHA, t: 2.7, d: 0.4 },
      { f: NI, t: 3.25, d: 0.4 },
      { f: SA2, t: 3.8, d: 0.75 },
      { f: PA2, t: 4.7, d: 0.4 },
      { f: MA2, t: 5.2, d: 0.35 },
      { f: GA2, t: 5.65, d: 0.35 },
      { f: SA2, t: 6.15, d: 1.05 },
    ],
  },
];

function scheduleNote(ctx, dest, start, note) {
  // Twin oscillators for a warmer filmi timbre + light meend
  const oscA = ctx.createOscillator();
  const oscB = ctx.createOscillator();
  const gain = ctx.createGain();
  oscA.type = "sine";
  oscB.type = "triangle";
  oscA.frequency.setValueAtTime(note.f * 0.985, start);
  oscA.frequency.exponentialRampToValueAtTime(note.f, start + 0.06);
  oscB.frequency.setValueAtTime(note.f * 0.5, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.13, start + 0.04);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + note.d);
  oscA.connect(gain);
  oscB.connect(gain);
  gain.connect(dest);
  oscA.start(start);
  oscB.start(start);
  oscA.stop(start + note.d + 0.05);
  oscB.stop(start + note.d + 0.05);
}

function startSongLoop(ctx, song, bus) {
  let nextLoopAt = ctx.currentTime + 0.08;
  let timerId = 0;
  let stopped = false;

  // Soft pad under melody
  const padNodes = (song.pad || []).map((freq) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.value = 0.035;
    osc.connect(gain);
    gain.connect(bus);
    osc.start();
    return { osc, gain };
  });

  function scheduleLoop() {
    if (stopped) return;
    const start = nextLoopAt;
    for (const note of song.notes) {
      scheduleNote(ctx, bus, start + note.t, note);
    }
    nextLoopAt += song.loop;
    const waitMs = Math.max(80, (nextLoopAt - ctx.currentTime - 0.6) * 1000);
    timerId = window.setTimeout(scheduleLoop, waitMs);
  }

  scheduleLoop();

  return () => {
    stopped = true;
    window.clearTimeout(timerId);
    for (const node of padNodes) {
      try {
        node.gain.gain.exponentialRampToValueAtTime(
          0.0001,
          ctx.currentTime + 0.25
        );
        node.osc.stop(ctx.currentTime + 0.3);
      } catch {
        /* already stopped */
      }
    }
  };
}

export function FlipSoundProvider({ children }) {
  const [muted, setMuted] = useState(false);
  const mutedRef = useRef(false);
  const ctxRef = useRef(null);
  const busRef = useRef(null);
  const stopSongRef = useRef(null);
  const songStartedRef = useRef(false);
  const chosenSongRef = useRef(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(MUTE_KEY) === "1";
    setMuted(stored);
    mutedRef.current = stored;

    return () => {
      stopSongRef.current?.();
      stopSongRef.current = null;
    };
  }, []);

  const ensureContext = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = createAudioContext();
    }
    if (ctxRef.current && !busRef.current) {
      const bus = ctxRef.current.createGain();
      bus.gain.value = mutedRef.current ? 0.0001 : 0.22;
      bus.connect(ctxRef.current.destination);
      busRef.current = bus;
    }
    return ctxRef.current;
  }, []);

  const setBusMuted = useCallback((isMuted) => {
    const bus = busRef.current;
    const ctx = ctxRef.current;
    if (!bus || !ctx) return;
    const now = ctx.currentTime;
    bus.gain.cancelScheduledValues(now);
    bus.gain.setValueAtTime(bus.gain.value || 0.0001, now);
    bus.gain.exponentialRampToValueAtTime(
      isMuted ? 0.0001 : 0.22,
      now + 0.2
    );
  }, []);

  const beginSong = useCallback(async () => {
    if (songStartedRef.current) return;
    try {
      const ctx = ensureContext();
      if (!ctx || !busRef.current) return;
      if (ctx.state === "suspended") {
        await ctx.resume();
      }
      if (songStartedRef.current) return;

      if (!chosenSongRef.current) {
        chosenSongRef.current =
          SONGS[Math.floor(Math.random() * SONGS.length)];
      }

      setBusMuted(mutedRef.current);
      stopSongRef.current?.();
      stopSongRef.current = startSongLoop(
        ctx,
        chosenSongRef.current,
        busRef.current
      );
      songStartedRef.current = true;
    } catch {
      songStartedRef.current = false;
    }
  }, [ensureContext, setBusMuted]);

  const stopBackgroundSong = useCallback(() => {
    stopSongRef.current?.();
    stopSongRef.current = null;
    songStartedRef.current = false;
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((current) => {
      const next = !current;
      mutedRef.current = next;
      window.localStorage.setItem(MUTE_KEY, next ? "1" : "0");
      setBusMuted(next);
      return next;
    });
  }, [setBusMuted]);

  const playFlipSound = useCallback(() => {
    if (mutedRef.current) return;
    try {
      const ctx = ensureContext();
      if (!ctx) return;
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }
      playFlipTone(ctx);
    } catch {
      /* ignore */
    }
  }, [ensureContext]);

  const startBackgroundSong = useCallback(() => {
    beginSong();
  }, [beginSong]);

  return (
    <FlipSoundContext.Provider
      value={{
        muted,
        toggleMute,
        playFlipSound,
        startBackgroundSong,
        stopBackgroundSong,
      }}
    >
      {children}
    </FlipSoundContext.Provider>
  );
}

export function useFlipSound() {
  return useContext(FlipSoundContext);
}
