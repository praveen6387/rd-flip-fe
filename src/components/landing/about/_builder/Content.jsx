import ProductVisual from "./ProductVisual";

export default function Content() {
  return (
    <div className="grid gap-24 lg:grid-cols-2 lg:items-center">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.22em] text-indigo-600 sm:text-base">
          Product
        </p>
        <h2 className="mt-4 font-heading text-4xl leading-tight text-slate-900 sm:text-5xl">
          A dashboard for making and sending flipbooks
        </h2>
        <div className="mt-5 space-y-4 text-lg leading-8 text-slate-600 sm:text-xl sm:leading-9">
          <p>
            We transform your photos into elegant digital flipbooks that work
            seamlessly on all devices. Share them instantly using smart{" "}
            <span className="font-semibold text-emerald-600">QR codes</span> and
            give your guests a premium, branded viewing experience.
          </p>
          <p>
            Our flipbooks feature smooth page-turn effects, optional background
            music, and full mobile support. With high-quality QR codes, one-tap
            browser access (no app needed), custom branding, secure hosting, and
            priority support, sharing memories becomes effortless and professional.
          </p>
        </div>
      </div>
      <ProductVisual />
    </div>
  );
}
