"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Music2, Pause, Play, Plus, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { createSong, fetchSongs } from "@/lib/api/client/songs";
import { cn } from "@/lib/cn";

function glassInput(isDark) {
  return cn(
    "h-11 rounded-xl border px-3.5 text-[15px] shadow-none",
    isDark
      ? "border-white/12 bg-[#1a222d] text-white placeholder:text-slate-500 focus-visible:border-sky-400/50 focus-visible:bg-[#1f2936] focus-visible:ring-sky-400/20"
      : "border-[#e0d5c4]/90 bg-[#fffcf8]/95 text-slate-900 placeholder:text-slate-400 focus-visible:border-sky-400/60 focus-visible:bg-white focus-visible:ring-sky-300/30"
  );
}

function formatClock(ms) {
  if (!ms || ms < 0) return "0:00";
  const total = Math.round(ms / 1000);
  const minutes = Math.floor(total / 60);
  const seconds = String(total % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function songMeta(song) {
  return [song.category, song.description].filter(Boolean).join(" · ");
}

function songAudio(song) {
  return song.audio_url || "";
}

function matchesSong(song, needle) {
  if (!needle) return true;
  const haystack = [song.name, song.category, song.description]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(needle);
}

function TimelineBar({
  song,
  active,
  percent,
  isDark,
  draggingRef,
  onSeek,
  onSeekPreview,
}) {
  const barPercent = active ? percent : 0;

  function ratioFromPointer(event, el) {
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0) return 0;
    return Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
  }

  function handlePointerDown(event) {
    event.preventDefault();
    event.stopPropagation();
    draggingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    onSeek(song, ratioFromPointer(event, event.currentTarget));
  }

  function handlePointerMove(event) {
    if (!draggingRef.current) return;
    event.preventDefault();
    onSeekPreview(song, ratioFromPointer(event, event.currentTarget));
  }

  function handlePointerUp(event) {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    event.currentTarget.releasePointerCapture(event.pointerId);
    onSeek(song, ratioFromPointer(event, event.currentTarget));
  }

  return (
    <div
      role="slider"
      tabIndex={0}
      aria-label="Seek song"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(barPercent)}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => {
        draggingRef.current = false;
      }}
      className="flex h-4 w-full cursor-pointer items-center [&_*]:cursor-pointer"
    >
      <span
        className={cn(
          "relative h-1.5 w-full overflow-hidden rounded-full",
          isDark ? "bg-white/15" : "bg-slate-200"
        )}
      >
        <span
          className="absolute inset-y-0 left-0 rounded-full bg-sky-500"
          style={{
            width: `${barPercent}%`,
            transition: draggingRef.current ? "none" : "width 80ms linear",
          }}
        />
      </span>
    </div>
  );
}

function Artwork({ src, className }) {
  if (!src) {
    return (
      <span
        className={cn(
          "grid shrink-0 place-items-center rounded-md bg-slate-100",
          className
        )}
      >
        <Music2 className="size-4 text-slate-400" />
      </span>
    );
  }

  return (
    <img src={src} alt="" className={cn("shrink-0 rounded-md object-cover", className)} />
  );
}

const SongRow = memo(function SongRow({
  song,
  isDark,
  selected,
  active,
  isPlaying,
  loading,
  percent,
  currentMs,
  totalMs,
  draggingRef,
  onPick,
  onTogglePlay,
  onSeek,
  onSeekPreview,
}) {
  return (
    <div
      className={cn(
        "rounded-lg px-2 py-2.5",
        selected
          ? isDark
            ? "bg-white/10"
            : "bg-slate-100"
          : isDark
            ? "hover:bg-white/8"
            : "hover:bg-slate-100"
      )}
    >
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => onPick(song)}
          className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
        >
          <Artwork src="" className="size-10" />
          <span className="min-w-0">
            <span className="block truncate text-[15px] font-medium">
              {song.name}
            </span>
            <span
              className={cn(
                "block truncate text-xs",
                isDark ? "text-slate-400" : "text-slate-500"
              )}
            >
              {songMeta(song)}
            </span>
          </span>
        </button>
        <span
          className={cn(
            "shrink-0 text-[11px] tabular-nums",
            isDark ? "text-slate-400" : "text-slate-500"
          )}
        >
          {active ? `${formatClock(currentMs)} / ${formatClock(totalMs)}` : ""}
        </span>
        <button
          type="button"
          disabled={!songAudio(song)}
          onClick={(event) => onTogglePlay(event, song)}
          className={cn(
            "grid size-8 shrink-0 place-items-center rounded-full",
            !songAudio(song)
              ? "cursor-not-allowed opacity-40"
              : isDark
                ? "text-slate-200 hover:bg-white/10"
                : "text-slate-700 hover:bg-slate-200/80"
          )}
          aria-label={
            loading
              ? "Loading song"
              : active && isPlaying
                ? "Pause preview"
                : "Play preview"
          }
        >
          {loading ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : active && isPlaying ? (
            <Pause className="size-3.5 fill-current" />
          ) : (
            <Play className="size-3.5 fill-current" />
          )}
        </button>
      </div>
      <div className="mt-1.5 ml-12">
        <TimelineBar
          song={song}
          active={active}
          percent={percent}
          isDark={isDark}
          draggingRef={draggingRef}
          onSeek={onSeek}
          onSeekPreview={onSeekPreview}
        />
      </div>
    </div>
  );
});

export default function SongPicker({ isDark, value, onChange, initialSongs = [] }) {
  const rootRef = useRef(null);
  const audioRef = useRef(null);
  const progressRafRef = useRef(0);
  const playingIdRef = useRef("");
  const isPlayingRef = useRef(false);
  const draggingRef = useRef(false);
  const dropdownSearchRef = useRef(null);
  const catalogRef = useRef(initialSongs);
  const handlersRef = useRef({});
  const [query, setQuery] = useState("");
  const [catalog, setCatalog] = useState(initialSongs);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [playingId, setPlayingId] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [loadingId, setLoadingId] = useState("");
  const [progress, setProgress] = useState({ current: 0, duration: 0 });
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [addError, setAddError] = useState("");
  const [addFile, setAddFile] = useState(null);

  function markPlayingId(id) {
    playingIdRef.current = id;
    setPlayingId(id);
  }

  function markIsPlaying(next) {
    isPlayingRef.current = next;
    setIsPlaying(next);
  }

  function markLoadingId(id) {
    setLoadingId(id);
  }

  function attachAudioEvents(audio) {
    audio.onloadedmetadata = () => {
      const duration = Number.isFinite(audio.duration) ? audio.duration * 1000 : 0;
      setProgress((current) => ({
        ...current,
        duration,
      }));
    };
    audio.ontimeupdate = () => {
      if (draggingRef.current) return;
      if (progressRafRef.current) return;
      progressRafRef.current = window.requestAnimationFrame(() => {
        progressRafRef.current = 0;
        const current = audioRef.current;
        if (!current) return;
        const duration = Number.isFinite(current.duration) ? current.duration * 1000 : 0;
        setProgress({
          current: current.currentTime * 1000,
          duration,
        });
      });
    };
    audio.onwaiting = () => {
      if (playingIdRef.current) markLoadingId(playingIdRef.current);
    };
    audio.onplaying = () => {
      markLoadingId("");
      markIsPlaying(true);
    };
    audio.onended = () => {
      markLoadingId("");
      markIsPlaying(false);
      const duration = Number.isFinite(audio.duration) ? audio.duration * 1000 : 0;
      setProgress({ current: 0, duration });
    };
  }

  function stopPreview() {
    if (progressRafRef.current) {
      window.cancelAnimationFrame(progressRafRef.current);
      progressRafRef.current = 0;
    }
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }
    audioRef.current = null;
    markPlayingId("");
    markIsPlaying(false);
    markLoadingId("");
    setProgress({ current: 0, duration: 0 });
  }

  useEffect(() => {
    catalogRef.current = initialSongs;
    setCatalog(initialSongs);
  }, [initialSongs]);

  useEffect(() => {
    if (!value) {
      setSelected(null);
      return;
    }
    setSelected((current) => {
      if (current?.id === String(value)) return current;
      return initialSongs.find((song) => song.id === String(value)) || current;
    });
  }, [value, initialSongs]);

  useEffect(() => {
    return () => stopPreview();
  }, []);

  useEffect(() => {
    if (!open || adding) return;
    const frame = window.requestAnimationFrame(() => {
      dropdownSearchRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [open, adding]);

  useEffect(() => {
    function handleClick(event) {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return catalog;
    return catalog.filter((song) => matchesSong(song, needle));
  }, [catalog, query]);

  function pickSong(song) {
    setSelected(song);
    setQuery("");
    setOpen(false);
    onChange(song.id);
  }

  function clearSong() {
    stopPreview();
    setSelected(null);
    setQuery("");
    onChange("");
  }

  function resetAddForm() {
    setAddFile(null);
    setAddError("");
    setSaving(false);
  }

  function closeAddForm() {
    setAdding(false);
    resetAddForm();
  }

  async function handleAddSong(event) {
    event.preventDefault();
    event.stopPropagation();
    if (saving) return;

    if (!addFile) {
      setAddError("Choose an MP3 file.");
      return;
    }

    setSaving(true);
    setAddError("");
    try {
      const song = await createSong(addFile);
      const latest = await fetchSongs("");
      const next = latest.length
        ? latest
        : [song, ...catalogRef.current.filter((item) => item.id !== song.id)];
      catalogRef.current = next;
      setCatalog(next);
      setQuery("");
      closeAddForm();
      setOpen(true);
    } catch (uploadError) {
      setAddError(uploadError.message || "Could not add song.");
    } finally {
      setSaving(false);
    }
  }

  function ensureAudio(song) {
    if (audioRef.current && playingIdRef.current === song.id) {
      return audioRef.current;
    }

    stopPreview();
    const audio = new Audio(songAudio(song));
    audio.preload = "auto";
    audioRef.current = audio;
    attachAudioEvents(audio);
    markPlayingId(song.id);
    return audio;
  }

  async function waitForDuration(audio) {
    if (Number.isFinite(audio.duration) && audio.duration > 0) {
      return audio.duration;
    }
    await new Promise((resolve) => {
      audio.addEventListener("loadedmetadata", resolve, { once: true });
    });
    return audio.duration;
  }

  function applySeek(audio, ratio) {
    if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;
    const next = Math.min(audio.duration, Math.max(0, ratio * audio.duration));
    audio.currentTime = next;
    setProgress({
      current: next * 1000,
      duration: audio.duration * 1000,
    });
  }

  async function togglePlay(event, song) {
    event.preventDefault();
    event.stopPropagation();
    if (!songAudio(song)) return;

    const existing = audioRef.current;
    if (existing && playingIdRef.current === song.id) {
      if (isPlayingRef.current) {
        existing.pause();
        markIsPlaying(false);
        markLoadingId("");
      } else {
        markLoadingId(song.id);
        try {
          await existing.play();
        } catch {
          markIsPlaying(false);
          markLoadingId("");
        }
      }
      return;
    }

    try {
      const audio = ensureAudio(song);
      markLoadingId(song.id);
      await audio.play();
    } catch {
      markIsPlaying(false);
      markLoadingId("");
    }
  }

  async function seekToRatio(song, ratio, { playAfter = true } = {}) {
    if (!songAudio(song)) return;
    const audio = ensureAudio(song);
    await waitForDuration(audio);
    applySeek(audio, ratio);
    if (playAfter && !isPlayingRef.current) {
      markLoadingId(song.id);
      try {
        await audio.play();
      } catch {
        markIsPlaying(false);
        markLoadingId("");
      }
    }
  }

  const percent =
    progress.duration > 0 ? Math.min(100, (progress.current / progress.duration) * 100) : 0;

  function seekPreview(song, ratio) {
    seekToRatio(song, ratio, { playAfter: false });
  }

  handlersRef.current = {
    pickSong,
    togglePlay,
    seekToRatio,
    seekPreview,
  };

  const onPick = useCallback((song) => {
    handlersRef.current.pickSong(song);
  }, []);
  const onTogglePlay = useCallback((event, song) => {
    handlersRef.current.togglePlay(event, song);
  }, []);
  const onSeek = useCallback((song, ratio) => {
    handlersRef.current.seekToRatio(song, ratio);
  }, []);
  const onSeekPreview = useCallback((song, ratio) => {
    handlersRef.current.seekPreview(song, ratio);
  }, []);

  return (
    <div ref={rootRef} className="relative z-30 [&_button:not(:disabled)]:cursor-pointer">
      {selected ? (
        <div
          className={cn(
            glassInput(isDark),
            "flex h-[4.25rem] flex-col justify-center gap-1.5 py-1.5 pr-2 pl-2"
          )}
        >
          <div className="flex min-h-0 items-center gap-2.5">
            <button
              type="button"
              onClick={() => setOpen((next) => !next)}
              className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
            >
              <Artwork src="" className="size-9" />
              <span className="min-w-0">
                <span className="block truncate text-[15px] font-medium leading-5">
                  {selected.name}
                </span>
                <span
                  className={cn(
                    "block truncate text-[11px] leading-4",
                    isDark ? "text-slate-400" : "text-slate-500"
                  )}
                >
                  {songMeta(selected)}
                </span>
              </span>
            </button>
            <span
              className={cn(
                "shrink-0 text-[11px] tabular-nums",
                isDark ? "text-slate-400" : "text-slate-500"
              )}
            >
              {playingId === selected.id
                ? `${formatClock(progress.current)} / ${formatClock(progress.duration)}`
                : ""}
            </span>
            <button
              type="button"
              disabled={!songAudio(selected)}
              onClick={(event) => togglePlay(event, selected)}
              className={cn(
                "grid size-8 shrink-0 place-items-center rounded-full",
                !songAudio(selected)
                  ? "cursor-not-allowed opacity-40"
                  : isDark
                    ? "cursor-pointer text-slate-200 hover:bg-white/10"
                    : "cursor-pointer text-slate-700 hover:bg-slate-200/70"
              )}
              aria-label={
                loadingId === selected.id
                  ? "Loading song"
                  : isPlaying && playingId === selected.id
                    ? "Pause song"
                    : "Play song"
              }
            >
              {loadingId === selected.id ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : isPlaying && playingId === selected.id ? (
                <Pause className="size-3.5 fill-current" />
              ) : (
                <Play className="size-3.5 fill-current" />
              )}
            </button>
            <button
              type="button"
              onClick={clearSong}
              className={cn(
                "grid size-8 shrink-0 place-items-center rounded-full",
                isDark
                  ? "text-slate-400 hover:bg-white/10 hover:text-white"
                  : "text-slate-400 hover:bg-slate-200/70 hover:text-slate-700"
              )}
              aria-label="Clear song"
            >
              <X className="size-3.5" />
            </button>
          </div>
          <TimelineBar
            song={selected}
            active={playingId === selected.id}
            percent={percent}
            isDark={isDark}
            draggingRef={draggingRef}
            onSeek={onSeek}
            onSeekPreview={onSeekPreview}
          />
        </div>
      ) : (
        <button
          type="button"
          id="flipbook-song"
          onClick={() => setOpen(true)}
          className={cn(
            glassInput(isDark),
            "flex w-full items-center gap-2 pr-3 pl-9 text-left font-normal"
          )}
        >
          <Search
            className={cn(
              "pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2",
              isDark ? "text-slate-500" : "text-slate-400"
            )}
          />
          <span
            className={cn(
              "truncate",
              isDark ? "text-slate-500" : "text-slate-400"
            )}
          >
            Search songs
          </span>
        </button>
      )}

      {open ? (
        <div
          className={cn(
            "absolute top-[calc(100%+6px)] z-80 max-h-96 w-full overflow-y-auto rounded-xl border shadow-lg",
            isDark
              ? "border-white/10 bg-[#1a222d] text-white"
              : "border-[#e0d5c4] bg-white text-slate-900"
          )}
        >
          <div
            className={cn(
              "sticky top-0 z-10 border-b p-1.5",
              isDark ? "border-white/10 bg-[#1a222d]" : "border-[#e0d5c4]/70 bg-white"
            )}
          >
            <div className="relative">
              <Search
                className={cn(
                  "pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2",
                  isDark ? "text-slate-500" : "text-slate-400"
                )}
              />
              <Input
                ref={dropdownSearchRef}
                name="song_search"
                autoComplete="off"
                placeholder="Search songs"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className={cn(
                  "h-9 rounded-lg border px-8 text-[14px] shadow-none",
                  isDark
                    ? "border-white/12 bg-[#141b24] text-white placeholder:text-slate-500 focus-visible:border-sky-400/50 focus-visible:ring-sky-400/20"
                    : "border-[#e0d5c4]/90 bg-[#fffcf8] text-slate-900 placeholder:text-slate-400 focus-visible:border-sky-400/60 focus-visible:ring-sky-300/30"
                )}
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className={cn(
                    "absolute top-1/2 right-2.5 -translate-y-1/2",
                    isDark
                      ? "text-slate-500 hover:text-white"
                      : "text-slate-400 hover:text-slate-700"
                  )}
                  aria-label="Clear search"
                >
                  <X className="size-3.5" />
                </button>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => {
                setAdding((current) => !current);
                setAddError("");
              }}
              className={cn(
                "mt-1.5 flex h-8 w-full items-center justify-center gap-1.5 rounded-lg text-[13px] font-medium",
                isDark
                  ? "bg-white/8 text-slate-200 hover:bg-white/12"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200/80"
              )}
            >
              <Plus className="size-3.5" />
              Add song
            </button>
          </div>
          <div className="p-1">
          {adding ? (
            <div className="space-y-2 px-1.5 py-1.5">
              <label
                className={cn(
                  "flex h-9 cursor-pointer items-center rounded-lg border px-3 text-[13px]",
                  isDark
                    ? "border-white/12 bg-[#141b24] text-slate-300"
                    : "border-[#e0d5c4]/90 bg-[#fffcf8] text-slate-600"
                )}
              >
                <input
                  type="file"
                  accept=".mp3,audio/mpeg"
                  className="sr-only"
                  onChange={(event) => setAddFile(event.target.files?.[0] || null)}
                />
                <span className="truncate">
                  {addFile ? addFile.name : "Choose MP3"}
                </span>
              </label>
              {addError ? (
                <p className="text-[12px] text-rose-400">{addError}</p>
              ) : null}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={closeAddForm}
                  disabled={saving}
                  className={cn(
                    "h-8 flex-1 rounded-lg text-[13px]",
                    isDark
                      ? "bg-white/8 text-slate-300 hover:bg-white/12"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
                  )}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddSong}
                  disabled={saving}
                  className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg bg-sky-500 text-[13px] font-medium text-white hover:bg-sky-600 disabled:opacity-60"
                >
                  {saving ? <Loader2 className="size-3.5 animate-spin" /> : null}
                  {saving ? "Uploading…" : "Upload"}
                </button>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <p
              className={cn(
                "px-3 py-3 text-[13px]",
                isDark ? "text-slate-400" : "text-slate-500"
              )}
            >
              No songs found.
            </p>
          ) : (
            <>
              {!query.trim() ? (
                <p
                  className={cn(
                    "px-2.5 py-1.5 text-[11px] font-semibold tracking-wide uppercase",
                    isDark ? "text-slate-500" : "text-slate-400"
                  )}
                >
                  Songs
                </p>
              ) : null}
              <div className="space-y-1.5">
              {filtered.map((song) => {
                const active = playingId === song.id;
                return (
                  <SongRow
                    key={song.id}
                    song={song}
                    isDark={isDark}
                    selected={String(value) === song.id}
                    active={active}
                    isPlaying={active && isPlaying}
                    loading={loadingId === song.id}
                    percent={active ? percent : 0}
                    currentMs={active ? progress.current : 0}
                    totalMs={active ? progress.duration : 0}
                    draggingRef={draggingRef}
                    onPick={onPick}
                    onTogglePlay={onTogglePlay}
                    onSeek={onSeek}
                    onSeekPreview={onSeekPreview}
                  />
                );
              })}
              </div>
            </>
          )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
