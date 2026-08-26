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

function ClosedPage({ side, title, caption }) {
  const isFront = side === "right";

  return (
    <div className="flex h-full flex-col">
      <p className="text-xs font-medium text-slate-500">{title}</p>
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
      <p className="mt-2 text-xs leading-5 text-slate-500">{caption}</p>
    </div>
  );
}

function OpenSpread({ left, right, title, caption }) {
  return (
    <div className="flex h-full flex-col">
      <p className="text-xs font-medium text-slate-500">{title}</p>
      <div className="mt-2 flex h-20 items-center justify-center rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm sm:h-24 sm:p-3">
        <div className="flex h-full w-full overflow-hidden rounded-lg border border-slate-200 shadow-[0_8px_18px_-12px_rgba(15,23,42,0.25)]">
          <Leaf kind={left} label={left === "photo" ? "Photo" : "White"} />
          <div className="w-px bg-slate-200" />
          <Leaf kind={right} label={right === "photo" ? "Photo" : "White"} />
        </div>
      </div>
      <p className="mt-2 text-xs leading-5 text-slate-500">{caption}</p>
    </div>
  );
}

function LayoutBlock({ badge, title, body, children }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/85 p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-3">
        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-indigo-500 to-sky-500 text-xs font-bold text-white">
          {badge}
        </span>
        <div>
          <h4 className="text-base font-semibold text-slate-900">{title}</h4>
          <p className="mt-1 text-sm leading-6 text-slate-500">{body}</p>
        </div>
      </div>
      <div className="mt-5 grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </div>
  );
}

export default function Content() {
  return (
    <div>
      <div className="max-w-2xl">
        <p className="text-sm font-medium uppercase tracking-[0.22em] text-indigo-600 sm:text-base">
          How it works
        </p>
        <h2 className="mt-3 font-heading text-3xl leading-tight text-slate-900 sm:text-4xl">
          How you create a flipbook
        </h2>
        <p className="mt-3 text-base text-slate-500 sm:text-lg">
          One path: details → covers → middle pages → create.
        </p>
      </div>

      <ol className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {STEPS.map((step) => (
          <li
            key={step.n}
            className="rounded-2xl border border-white/70 bg-white/70 p-4 backdrop-blur-sm transition hover:border-indigo-200/80 hover:bg-white"
          >
            <span className="text-xs font-semibold tracking-widest text-indigo-500">
              {step.n}
            </span>
            <h3 className="mt-2 text-base font-semibold tracking-tight text-slate-900">
              {step.title}
            </h3>
            <p className="mt-1.5 text-sm leading-6 text-slate-500">{step.body}</p>
          </li>
        ))}
      </ol>

      <div className="mt-12 rounded-3xl border border-slate-200/80 bg-linear-to-br from-white/90 via-[#faf1fb]/60 to-indigo-50/40 p-6 sm:p-8">
        <div className="max-w-2xl">
          <h3 className="text-lg font-semibold text-slate-900 sm:text-xl">
            How pages look after upload
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
            Front, middle, and back each place photos differently — closed edges,
            white halves, and full photo spreads.
          </p>
        </div>

        <div className="mt-6 space-y-4">
          <LayoutBlock
            badge="F"
            title="Front cover images"
            body="First page is a closed-book right side. Next open spread is white left + photo right. Extra front uploads keep that white · photo pattern."
          >
            <ClosedPage
              side="right"
              title="Page 1 · closed"
              caption="Closed book — cover photo on the front."
            />
            <OpenSpread
              left="white"
              right="photo"
              title="Pages 2–3 · open"
              caption="Left white · right your upload."
            />
            <OpenSpread
              left="white"
              right="photo"
              title="More front uploads"
              caption="Same pattern continues for each extra image."
            />
          </LayoutBlock>

          <LayoutBlock
            badge="M"
            title="Middle images"
            body="Inside pages are full spreads — half photo on the left, half photo on the right, and so on."
          >
            <OpenSpread
              left="photo"
              right="photo"
              title="Open spread"
              caption="Left photo · right photo on one page."
            />
            <OpenSpread
              left="photo"
              right="photo"
              title="Next spread"
              caption="Continues the same way for more middles."
            />
            <OpenSpread
              left="photo"
              right="photo"
              title="More middle uploads"
              caption="Same left · right photo pairing keeps going."
            />
          </LayoutBlock>

          <LayoutBlock
            badge="B"
            title="Back cover images"
            body="Near the end: photo left · white right. The last page is a closed-book left side."
          >
            <OpenSpread
              left="photo"
              right="white"
              title="More back uploads"
              caption="Extra images add more photo · white spreads."
            />
            <OpenSpread
              left="photo"
              right="white"
              title="Pages n−3 · n−2"
              caption="Left your upload · right white."
            />
            <ClosedPage
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
