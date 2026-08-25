const FEATURES = [
  {
    title: "Dashboard tabs",
    body: "After login, move between create, library, search, and share from the side nav.",
  },
  {
    title: "Covers and insides",
    body: "Upload a front cover, a back cover, and the middle images — or fill each section with its own set.",
  },
  {
    title: "See and reorder",
    body: "On the create screen you see every image. Drag them into the order you want, then hit create.",
  },
  {
    title: "Library + search",
    body: "All books stay in one place. Find them by client name, date, or studio name.",
  },
  {
    title: "Preview, link, QR",
    body: "Open the book yourself, preview as the client will, copy a share link, or generate a QR to send.",
  },
  {
    title: "Studio name on Lab",
    body: "Lab plans can stamp another studio’s name on the flipbook when you produce for them.",
  },
];

export default function Content() {
  return (
    <div>
      <div className="max-w-lg">
        <p className="text-[11px] uppercase tracking-[0.25em] text-white/40">Inside the app</p>
        <h2 className="mt-3 font-heading text-3xl text-white">What you actually do in RD Flip</h2>
      </div>
      <div className="mt-10 grid gap-px bg-white/10 sm:grid-cols-2">
        {FEATURES.map((feature) => (
          <article key={feature.title} className="bg-[#0a0a0a] p-7">
            <h3 className="text-base text-white">{feature.title}</h3>
            <p className="mt-2 text-sm leading-6 text-white/55">{feature.body}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
