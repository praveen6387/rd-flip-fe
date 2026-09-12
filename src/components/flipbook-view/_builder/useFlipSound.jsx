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

/**
 * Public streamable track for the viewer.
 * Override with NEXT_PUBLIC_VIEWER_MUSIC_URL (your licensed Bollywood / studio MP3).
 */
const VIEWER_MUSIC_URL =
  process.env.NEXT_PUBLIC_VIEWER_MUSIC_URL ||
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

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

/** Short page-turn click (not the background song). */
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

export function FlipSoundProvider({ children }) {
  const [muted, setMuted] = useState(false);
  const mutedRef = useRef(false);
  const ctxRef = useRef(null);
  const audioRef = useRef(null);
  const songStartedRef = useRef(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(MUTE_KEY) === "1";
    setMuted(stored);
    mutedRef.current = stored;

    return () => {
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        audio.removeAttribute("src");
        audio.load();
      }
      audioRef.current = null;
      songStartedRef.current = false;
    };
  }, []);

  const ensureContext = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = createAudioContext();
    }
    return ctxRef.current;
  }, []);

  const ensureAudio = useCallback(() => {
    if (audioRef.current) return audioRef.current;
    const audio = new Audio(VIEWER_MUSIC_URL);
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = mutedRef.current ? 0 : 0.45;
    audioRef.current = audio;
    return audio;
  }, []);

  const applyMuteToAudio = useCallback((isMuted) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = isMuted ? 0 : 0.45;
    if (isMuted) {
      audio.pause();
    } else if (songStartedRef.current) {
      audio.play().catch(() => {});
    }
  }, []);

  const beginSong = useCallback(async () => {
    try {
      const audio = ensureAudio();
      if (audio.paused || !songStartedRef.current) {
        audio.volume = mutedRef.current ? 0 : 0.45;
        if (!mutedRef.current) {
          await audio.play();
        }
        songStartedRef.current = true;
      }
    } catch {
      /* autoplay blocked until next gesture */
    }
  }, [ensureAudio]);

  const stopBackgroundSong = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    songStartedRef.current = false;
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((current) => {
      const next = !current;
      mutedRef.current = next;
      window.localStorage.setItem(MUTE_KEY, next ? "1" : "0");
      applyMuteToAudio(next);
      if (!next) {
        beginSong();
      }
      return next;
    });
  }, [applyMuteToAudio, beginSong]);

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
