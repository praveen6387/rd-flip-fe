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
    <aside className="border border-white/10 p-6 lg:p-8">
      <p className="text-[11px] uppercase tracking-[0.22em] text-[#d4af37]">Before you write</p>
      <ul className="mt-6 space-y-5">
        {NOTES.map((note) => (
          <li key={note.title}>
            <p className="text-sm text-white">{note.title}</p>
            <p className="mt-1 text-sm leading-6 text-white/50">{note.body}</p>
          </li>
        ))}
      </ul>
    </aside>
  );
}
