import Link from "next/link";
import PagePanel from "@/components/dashboard/_builder/PagePanel";
import { ROUTES } from "@/lib/routes";

export default function Flipbook() {
  return (
    <PagePanel
      eyebrow="Library"
      title="Flipbook"
      description="Browse and manage the flipbooks you’ve published for your studio."
      actions={
        <Link
          href={ROUTES.dashboardCreateFlipbook}
          className="inline-flex h-10 items-center justify-center rounded-full bg-linear-to-r from-sky-500 to-rose-500 px-5 text-sm font-semibold text-white transition hover:brightness-110 active:scale-[0.98]"
        >
          Create new
        </Link>
      }
    >
      <div className="rounded-2xl border border-dashed border-stone-300 bg-white/50 px-5 py-10 text-center">
        <p className="text-sm font-semibold text-slate-900">No flipbooks yet</p>
        <p className="mt-2 text-sm text-slate-600">
          When you create one, it will show up in this glass shelf.
        </p>
      </div>
    </PagePanel>
  );
}
