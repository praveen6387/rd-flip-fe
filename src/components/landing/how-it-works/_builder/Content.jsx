"use client";

import MotionCard from "@/components/landing/_builder/MotionCard";

const STEPS = [
  {
    n: "01",
    title: "Open Create Flipbook",
    body: "From the dashboard side nav, open Create Flipbook.",
  },
  {
    n: "02",
    title: "Customer basics",
    body: "Add the customer name and function date.",
  },
  {
    n: "03",
    title: "Studio or Lab details",
    body: "Studio uses your profile name & socials. Lab fills studio name, socials, and a profile link for that book.",
  },
  {
    n: "04",
    title: "Upload the pages",
    body: "Front cover, then back cover, then middle images. Each section accepts multiple photos.",
  },
  {
    n: "05",
    title: "Rearrange & create",
    body: "Fix the order on the same screen, then create. The new book lands in your library.",
  },
];

function Leaf({ kind, label }) {
  const styles = {
    photo: "bg-linear-to-br from-indigo-400 to-sky-400 text-white",
    white: "bg-white text-slate-400",
  };

  return (
    <div
      className={`flex flex-1 items-center justify-center text-[9px] font-semibold uppercase tracking-wider sm:text-[10px] ${styles[kind]}`}
    >
      {label}
    </div>
  );
}

function ClosedPage({ side, title, caption, isDark = false }) {
  const isFront = side === "right";

  return (
    <div className="flex h-full flex-col">
      <p
        className={`text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}
      >
        {title}
      </p>
      <div className="mt-2 flex h-20 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm sm:h-24">
        <div
          className={`relative flex h-[78%] w-[40%] shadow-[0_8px_18px_-10px_rgba(79,70,229,0.5)] ${
            isFront ? "rounded-r-md rounded-l-sm" : "rounded-l-md rounded-r-sm"
          }`}
        >
          <span
            className={`absolute inset-y-1 w-1.5 bg-linear-to-b from-slate-100 to-slate-200 ${
              isFront ? "-right-1.5 rounded-r-sm" : "-left-1.5 rounded-l-sm"
            }`}
          />
          <span
            className={`absolute inset-y-0 w-2 bg-linear-to-b from-indigo-700 to-sky-700 ${
              isFront ? "left-0 rounded-l-sm" : "right-0 rounded-r-sm"
            }`}
          />
          <div
            className={`flex h-full w-full items-center justify-center bg-linear-to-br from-indigo-400 to-sky-400 text-[9px] font-semibold uppercase tracking-wider text-white sm:text-[10px] ${
              isFront ? "rounded-r-md pl-2" : "rounded-l-md pr-2"
            }`}
          >
            Photo
          </div>
        </div>
      </div>
      <p
        className={`mt-2 text-xs leading-5 ${isDark ? "text-slate-400" : "text-slate-500"}`}
      >
        {caption}
      </p>
    </div>
  );
}

function OpenSpread({ left, right, title, caption, isDark = false }) {
  return (
    <div className="flex h-full flex-col">
      <p
        className={`text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}
      >
        {title}
      </p>
      <div className="mt-2 flex h-20 items-center justify-center rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm sm:h-24 sm:p-3">
        <div className="flex h-full w-full overflow-hidden rounded-lg border border-slate-200 shadow-[0_8px_18px_-12px_rgba(15,23,42,0.25)]">
          <Leaf kind={left} label={left === "photo" ? "Photo" : "White"} />
          <div className="w-px bg-slate-200" />
          <Leaf kind={right} label={right === "photo" ? "Photo" : "White"} />
        </div>
      </div>
      <p
        className={`mt-2 text-xs leading-5 ${isDark ? "text-slate-400" : "text-slate-500"}`}
      >
        {caption}
      </p>
    </div>
  );
}

function LayoutBlock({ badge, title, body, children, isDark = false, index = 0 }) {
  return (
    <MotionCard
      index={index}
      className={`rounded-2xl border p-5 shadow-sm sm:p-6 ${
        isDark
          ? "border-white/12 bg-white/8"
          : "border-slate-200/80 bg-white/85"
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-indigo-500 to-sky-500 text-xs font-bold text-white">
          {badge}
        </span>
        <div>
          <h4
            className={`text-base font-semibold ${isDark ? "text-white" : "text-slate-900"}`}
          >
            {title}
          </h4>
          <p
            className={`mt-1 text-sm leading-6 ${isDark ? "text-slate-300" : "text-slate-500"}`}
          >
            {body}
          </p>
        </div>
      </div>
      <div className="mt-5 grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {children}
      </div>
    </MotionCard>
  );
}

export default function Content({ isDark = false }) {
  return (
    <div>
      <div className="max-w-2xl">
        <p
          className={`text-sm font-medium uppercase tracking-[0.22em] sm:text-base ${
            isDark ? "text-violet-300/80" : "text-indigo-600"
          }`}
        >
          How it works
        </p>
        <h2
          className={`mt-4 font-heading text-4xl leading-tight sm:text-5xl ${
            isDark ? "text-white" : "text-slate-900"
          }`}
        >
          How you create a flipbook
        </h2>
        <p
          className={`mt-5 text-lg leading-8 sm:text-xl sm:leading-9 ${
            isDark ? "text-slate-300" : "text-slate-500"
          }`}
        >
          One path: details → covers → middle pages → create.
        </p>
      </div>

      <ol className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {STEPS.map((step, index) => (
          <MotionCard
            key={step.n}
            as="li"
            index={index}
            className={`rounded-2xl border p-4 backdrop-blur-sm ${
              isDark
                ? "border-white/12 bg-white/8 hover:border-white/20 hover:bg-white/12"
                : "border-white/70 bg-white/70 hover:border-indigo-200/80 hover:bg-white"
            }`}
          >
            <span
              className={`text-xs font-semibold tracking-widest ${
                isDark ? "text-violet-300" : "text-indigo-500"
              }`}
            >
              {step.n}
            </span>
            <h3
              className={`mt-2 text-base font-semibold tracking-tight ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              {step.title}
            </h3>
            <p
              className={`mt-1.5 text-sm leading-6 ${
                isDark ? "text-slate-300" : "text-slate-500"
              }`}
            >
              {step.body}
            </p>
          </MotionCard>
        ))}
      </ol>

      <div
        className={`mt-12 rounded-3xl border p-6 sm:p-8 ${
          isDark
            ? "border-white/12 bg-white/5"
            : "border-slate-200/80 bg-linear-to-br from-white/90 via-[#faf1fb]/60 to-indigo-50/40"
        }`}
      >
        <div className="max-w-2xl">
          <h3
            className={`text-lg font-semibold sm:text-xl ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            How pages look after upload
          </h3>
          <p
            className={`mt-2 text-sm leading-6 sm:text-base ${
              isDark ? "text-slate-300" : "text-slate-500"
            }`}
          >
            Front, middle, and back each place photos differently — closed edges,
            white halves, and full photo spreads.
          </p>
        </div>

        <div className="mt-6 space-y-4">
          <LayoutBlock
            index={0}
            isDark={isDark}
            badge="F"
            title="Front cover images"
            body="First page is a closed-book right side. Next open spread is white left + photo right. Extra front uploads keep that white · photo pattern."
          >
            <ClosedPage
              isDark={isDark}
              side="right"
              title="Page 1 · closed"
              caption="Closed book — cover photo on the front."
            />
            <OpenSpread
              isDark={isDark}
              left="white"
              right="photo"
              title="Pages 2–3 · open"
              caption="Left white · right your upload."
            />
            <OpenSpread
              isDark={isDark}
              left="white"
              right="photo"
              title="More front uploads"
              caption="Same pattern continues for each extra image."
            />
          </LayoutBlock>

          <LayoutBlock
            index={1}
            isDark={isDark}
            badge="M"
            title="Middle images"
            body="Inside pages are full spreads — half photo on the left, half photo on the right, and so on."
          >
            <OpenSpread
              isDark={isDark}
              left="photo"
              right="photo"
              title="Open spread"
              caption="Left photo · right photo on one page."
            />
            <OpenSpread
              isDark={isDark}
              left="photo"
              right="photo"
              title="Next spread"
              caption="Continues the same way for more middles."
            />
            <OpenSpread
              isDark={isDark}
              left="photo"
              right="photo"
              title="More middle uploads"
              caption="Same left · right photo pairing keeps going."
            />
          </LayoutBlock>

          <LayoutBlock
            index={2}
            isDark={isDark}
            badge="B"
            title="Back cover images"
            body="Near the end: photo left · white right. The last page is a closed-book left side."
          >
            <OpenSpread
              isDark={isDark}
              left="photo"
              right="white"
              title="More back uploads"
              caption="Extra images add more photo · white spreads."
            />
            <OpenSpread
              isDark={isDark}
              left="photo"
              right="white"
              title="Pages n−3 · n−2"
              caption="Left your upload · right white."
            />
            <ClosedPage
              isDark={isDark}
              side="left"
              title="Page n · closed"
              caption="Closed book — last photo on the back."
            />
          </LayoutBlock>
        </div>
      </div>
    </div>
  );
}
