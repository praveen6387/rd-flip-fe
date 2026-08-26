const STEPS = [
  {
    t: "Sign up and open the dashboard",
    d: "You land in a side nav. One free credit is waiting — it lasts 7 days.",
  },
  {
    t: "Fill the customer / book info",
    d: "Name the job so you can search it later by client, date, or studio.",
  },
  {
    t: "Place the images",
    d: "Front cover, inside pages, back cover. Or drop images into each section. Preview them, then rearrange on that same page.",
  },
  {
    t: "Create, then send",
    d: "Hit create. Open it, preview it, share the link, or generate a QR for the customer. Paid links do not expire.",
  },
];

export default function Content() {
  return (
    <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr]">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.22em] text-indigo-600 sm:text-base">
          Flow
        </p>
        <h2 className="mt-4 font-heading text-4xl leading-tight text-slate-900 sm:text-5xl">
          From signup to a QR in the client’s hand
        </h2>
      </div>
      <ol className="relative border-l-2 border-slate-200 pl-10">
        {STEPS.map((step, index) => (
          <li key={step.t} className="relative pb-12 last:pb-0">
            <span className="absolute top-2 -left-[49px] size-4 rounded-full bg-linear-to-r from-indigo-500 to-sky-500 shadow" />
            <p className="text-sm text-slate-400">{String(index + 1).padStart(2, "0")}</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-900">{step.t}</h3>
            <p className="mt-2 max-w-xl text-lg leading-8 text-slate-600">{step.d}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
