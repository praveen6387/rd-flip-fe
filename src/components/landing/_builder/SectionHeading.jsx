export default function SectionHeading({ eyebrow, title, accent, body, align = "center" }) {
  return (
    <div className={align === "left" ? "max-w-xl text-left" : "mx-auto max-w-2xl text-center"}>
      {eyebrow ? (
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.22em] text-[#d4af37]">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="font-heading text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        {title}{" "}
        {accent ? <span className="italic text-[#d4af37]">{accent}</span> : null}
      </h2>
      {body ? (
        <p className="mt-4 text-base leading-7 text-white/65">{body}</p>
      ) : null}
    </div>
  );
}
