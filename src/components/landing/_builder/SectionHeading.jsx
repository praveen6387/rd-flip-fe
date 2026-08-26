export default function SectionHeading({ eyebrow, title, accent, body, align = "center" }) {
  return (
    <div className={align === "left" ? "max-w-2xl text-left" : "mx-auto max-w-3xl text-center"}>
      {eyebrow ? (
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.22em] text-indigo-600 sm:text-base">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="font-heading text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
        {title}{" "}
        {accent ? (
          <span className="bg-linear-to-r from-rose-500 to-pink-500 bg-clip-text italic text-transparent">
            {accent}
          </span>
        ) : null}
      </h2>
      {body ? (
        <p className="mt-5 text-lg leading-8 text-slate-600 sm:text-xl sm:leading-9">{body}</p>
      ) : null}
    </div>
  );
}
