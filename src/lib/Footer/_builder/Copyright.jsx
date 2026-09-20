import Link from "next/link";
import { ROUTES } from "@/lib/routes";

export default function Copyright() {
  return (
    <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-white/45">
        © {new Date().getFullYear()} RD Flip. All rights reserved.
      </p>
      <div className="flex items-center gap-5 text-sm text-white/45">
        <Link href={ROUTES.privacy} className="transition hover:text-white/80">
          Privacy Policy
        </Link>
        <Link href={ROUTES.terms} className="transition hover:text-white/80">
          Terms & Conditions
        </Link>
        <Link href={ROUTES.refund} className="transition hover:text-white/80">
          Refund Policy
        </Link>
      </div>
    </div>
  );
}
