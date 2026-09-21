"use client";

import { cn } from "@/lib/cn";
import ProductVisual from "./ProductVisual";

export default function Content({ isDark = false }) {
  return (
    <div className="grid gap-16 lg:grid-cols-2 lg:items-center lg:gap-12">
      <div>
        <p
          className={cn(
            "text-sm font-medium uppercase tracking-[0.22em] sm:text-base",
            isDark ? "text-violet-300/80" : "text-indigo-600"
          )}
        >
          Product
        </p>
        <h2
          className={cn(
            "mt-4 font-heading text-4xl leading-tight sm:text-5xl",
            isDark ? "text-white" : "text-slate-900"
          )}
        >
          A dashboard for making and sending flipbooks
        </h2>
        <div
          className={cn(
            "mt-5 space-y-4 text-lg leading-8 sm:text-xl sm:leading-9",
            isDark ? "text-slate-300" : "text-slate-600"
          )}
        >
          <p>
            We transform your photos into elegant digital flipbooks that work
            seamlessly on all devices. Share them instantly using smart{" "}
            <span
              className={cn(
                "font-semibold",
                isDark ? "text-emerald-400" : "text-emerald-600"
              )}
            >
              QR codes
            </span>{" "}
            and give your guests a premium, branded viewing experience.
          </p>
          <p>
            Our flipbooks feature smooth page-turn effects, optional background
            music, and full mobile support. With high-quality QR codes, one-tap
            browser access (no app needed), custom branding, secure hosting, and
            priority support, sharing memories becomes effortless and
            professional.
          </p>
        </div>
      </div>
      <ProductVisual isDark={isDark} />
    </div>
  );
}
