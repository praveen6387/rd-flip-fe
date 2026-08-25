export default function Content() {
  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
      <div>
        <p className="text-[11px] uppercase tracking-[0.25em] text-white/40">Product</p>
        <h2 className="mt-3 font-heading text-3xl text-white">
          A dashboard for making and sending flipbooks
        </h2>
        <p className="mt-4 text-sm leading-6 text-white/55">
          You log in, work from the side tabs, and keep every book in one list.
          Studio accounts make books for their own work. Lab accounts make books
          for other studios too, with extra credits and a studio name on the job.
        </p>
      </div>
      <ul className="space-y-4 text-sm text-white/60">
        <li className="border-b border-white/10 pb-4">
          Signup includes 1 free credit. Use it within 7 days or it expires.
        </li>
        <li className="border-b border-white/10 pb-4">
          A book made only on that free credit expires in 30 days unless you
          recharge at least once.
        </li>
        <li>
          Paid share links and QR codes do not time out.
        </li>
      </ul>
    </div>
  );
}
