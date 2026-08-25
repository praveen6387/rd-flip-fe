"use client";

import { useEffect, useState } from "react";
import { LINKS } from "./links";

export function useActiveSection() {
  const [active, setActive] = useState("#home");

  useEffect(() => {
    const elements = LINKS.map((link) => document.getElementById(link.href.slice(1))).filter(
      Boolean,
    );

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) {
          setActive(`#${visible.target.id}`);
        }
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.25, 0.5] },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return active;
}
