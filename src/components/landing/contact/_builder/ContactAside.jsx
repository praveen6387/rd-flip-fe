const NOTES = [
  {
    title: "Free credit",
    body: "Signup gives 1 flipbook credit. It expires in 7 days if unused.",
  },
  {
    title: "Free books",
    body: "A flipbook made only on that free credit expires in 30 days unless you recharge once.",
  },
  {
    title: "Paid links",
    body: "After you recharge, share links and QR codes have no time limit.",
  },
  {
    title: "Find a book",
    body: "Search the dashboard by client name, date, or studio name (Lab).",
  },
];

export default function ContactAside() {
  return (
    <aside className="rounded-2xl border border-slate-200 bg-white/80 p-7 shadow-sm lg:p-9">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-600 sm:text-base">
        Before you write
      </p>
      <ul className="mt-7 space-y-6">
        {NOTES.map((note) => (
          <li key={note.title}>
            <p className="text-lg font-semibold text-slate-900">{note.title}</p>
            <p className="mt-2 text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
              {note.body}
            </p>
          </li>
        ))}
      </ul>
    </aside>
  );
}
