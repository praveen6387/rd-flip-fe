"use client";

import { useState } from "react";
import { BookOpen } from "lucide-react";
import { s3DisplaySrc } from "@/lib/s3/media";
import { cn } from "@/lib/cn";

export default function SignedImg({ src, alt = "", className, fallbackClassName }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className={cn("grid size-full place-items-center", fallbackClassName)}>
        <BookOpen className="size-5 opacity-70" />
      </div>
    );
  }

  return (
    <img
      src={s3DisplaySrc(src)}
      alt={alt}
      decoding="async"
      referrerPolicy="no-referrer"
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
