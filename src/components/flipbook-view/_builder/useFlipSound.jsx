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

const VIEWER_MUSIC_URL =
  process.env.NEXT_PUBLIC_VIEWER_MUSIC_URL ||
  "/tone/default.mp3";

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

function isStoredMuted() {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
}

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

export function FlipSoundProvider({ children, audioUrl = "" }) {
  const trackUrl = String(audioUrl || "").trim() || VIEWER_MUSIC_URL;
  const [muted, setMuted] = useState(false);
  const mutedRef = useRef(false);
  const ctxRef = useRef(null);
  const audioRef = useRef(null);

  const beginSong = useCallback(async () => {
    const audio = audioRef.current;
    const storedMuted = isStoredMuted();
    if (storedMuted) {
      mutedRef.current = true;
      setMuted(true);
    }
    if (!audio || mutedRef.current || storedMuted) {
      if (audio && (mutedRef.current || storedMuted)) {
        audio.muted = true;
        audio.volume = 0;
        audio.pause();
      }
      return;
    }
    try {
      audio.muted = false;
      audio.volume = 0.45;
      await audio.play();
    } catch {
      /* ignored */
    }
  }, []);

  useEffect(() => {
    const stored = isStoredMuted();
    setMuted(stored);
    mutedRef.current = stored;
    const audio = audioRef.current;
    if (audio) {
      audio.muted = stored;
      audio.volume = stored ? 0 : 0.45;
      if (stored) audio.pause();
    }

    return () => {
      audioRef.current?.pause();
    };
  }, []);

  const ensureContext = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = createAudioContext();
    }
    return ctxRef.current;
  }, []);

  const applyMuteToAudio = useCallback((isMuted) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = isMuted;
    audio.volume = isMuted ? 0 : 0.45;
    if (isMuted) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
  }, []);

  const stopBackgroundSong = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((current) => {
      const next = !current;
      mutedRef.current = next;
      window.localStorage.setItem(MUTE_KEY, next ? "1" : "0");
      applyMuteToAudio(next);
      if (!next) beginSong();
      return next;
    });
  }, [applyMuteToAudio, beginSong]);

  const playFlipSound = useCallback(() => {
    beginSong();
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
  }, [beginSong, ensureContext]);

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
      <audio
        ref={audioRef}
        loop
        playsInline
        preload="auto"
        muted={muted}
        src={trackUrl}
        className="pointer-events-none fixed h-px w-px opacity-0"
      />
      {children}
    </FlipSoundContext.Provider>
  );
}

export function useFlipSound() {
  return useContext(FlipSoundContext);
}
