export default function Copyright() {
  return (
    <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-white/45">
        © {new Date().getFullYear()} RD Flip. All rights reserved.
      </p>
      <div className="flex items-center gap-5 text-sm text-white/45">
        <a href="#" className="transition hover:text-white/80">
          Privacy Policy
        </a>
        <a href="#" className="transition hover:text-white/80">
          Terms of Service
        </a>
      </div>
    </div>
  );
}
