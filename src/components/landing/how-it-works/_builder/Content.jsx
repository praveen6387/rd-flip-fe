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
    <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr]">
      <div>
        <p className="text-[11px] uppercase tracking-[0.25em] text-white/40">Flow</p>
        <h2 className="mt-3 font-heading text-3xl text-white">From signup to a QR in the client’s hand</h2>
      </div>
      <ol className="relative border-l border-white/15 pl-8">
        {STEPS.map((step, index) => (
          <li key={step.t} className="relative pb-10 last:pb-0">
            <span className="absolute top-1.5 -left-[39px] size-3 rounded-full bg-[#d4af37]" />
            <p className="text-xs text-white/35">{String(index + 1).padStart(2, "0")}</p>
            <h3 className="mt-1 text-lg text-white">{step.t}</h3>
            <p className="mt-1 max-w-md text-sm text-white/55">{step.d}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
