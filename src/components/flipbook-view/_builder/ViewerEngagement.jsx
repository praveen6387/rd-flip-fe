"use client";

import { useEffect, useState } from "react";
import { Eye, Heart } from "lucide-react";
import {
  recordFlipbookView,
  toggleFlipbookLike,
} from "@/lib/api/client/flipbook";

const viewLoads = new Map();

function loadViewOnce(flipId) {
  const key = String(flipId);
  if (!viewLoads.has(key)) {
    const request = recordFlipbookView(key).finally(() => {
      viewLoads.delete(key);
    });
    viewLoads.set(key, request);
  }
  return viewLoads.get(key);
}

function formatCount(value) {
  return Number(value || 0).toLocaleString("en-IN");
}

export default function ViewerEngagement({ flipId }) {
  const [engagement, setEngagement] = useState(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let cancelled = false;

    loadViewOnce(flipId)
      .then((data) => {
        if (!cancelled) setEngagement(data);
      })
      .catch(() => {
        if (!cancelled) setEngagement(null);
      });

    return () => {
      cancelled = true;
    };
  }, [flipId]);

  async function handleLike() {
    if (!engagement || pending) return;

    const previous = engagement;
    const liked = !engagement.liked;
    setEngagement({
      ...engagement,
      liked,
      like_count: Math.max(0, engagement.like_count + (liked ? 1 : -1)),
    });
    setPending(true);

    try {
      const data = await toggleFlipbookLike(flipId);
      setEngagement(data);
    } catch {
      setEngagement(previous);
    } finally {
      setPending(false);
    }
  }

  const ready = engagement != null;

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <span
        className="flex h-9 items-center gap-1 rounded-full border border-amber-200/25 bg-black/30 px-2.5 text-[11px] text-amber-200/85"
        title="Views"
      >
        <Eye className="size-3.5" strokeWidth={1.75} aria-hidden />
        <span className="min-w-[0.5rem] tabular-nums">
          {ready ? formatCount(engagement.view_count) : ""}
        </span>
      </span>
      <button
        type="button"
        onClick={handleLike}
        disabled={!ready || pending}
        aria-pressed={ready ? engagement.liked : false}
        aria-label={engagement?.liked ? "Unlike" : "Like"}
        title={engagement?.liked ? "Unlike" : "Like"}
        className="flex h-9 items-center gap-1 rounded-full border border-amber-200/25 bg-black/30 px-2.5 text-[11px] text-amber-200/85 transition hover:bg-white/10 hover:text-amber-200 disabled:cursor-default disabled:opacity-70"
      >
        <Heart
          className={`size-3.5 ${
            engagement?.liked ? "fill-rose-400 text-rose-400" : ""
          }`}
          strokeWidth={1.75}
          aria-hidden
        />
        <span className="min-w-[0.5rem] tabular-nums">
          {ready ? formatCount(engagement.like_count) : ""}
        </span>
      </button>
    </div>
  );
}
