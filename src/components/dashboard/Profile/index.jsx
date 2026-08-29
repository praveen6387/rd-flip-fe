"use client";

import { useAuth } from "@/components/auth";
import PagePanel from "@/components/dashboard/_builder/PagePanel";

export default function Profile() {
  const { user } = useAuth();
  const fullName =
    [user?.first_name, user?.last_name].filter(Boolean).join(" ") || "—";

  const fields = [
    { label: "Name", value: fullName },
    { label: "Email", value: user?.email || "—" },
    { label: "Phone", value: user?.phone || "—" },
    { label: "Studio", value: user?.studio_name || "—" },
    { label: "Plan", value: user?.plan || "—" },
  ];

  return (
    <PagePanel
      eyebrow="Account"
      title="Profile"
      description="Your studio identity at a glance. Edit flows will land here next."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {fields.map((field, index) => (
          <div
            key={field.label}
            className="group rounded-2xl border border-stone-200/80 bg-white/70 p-4 transition duration-300 hover:-translate-y-0.5 hover:border-sky-300 hover:bg-white hover:shadow-md"
            style={{ animationDelay: `${120 + index * 50}ms` }}
          >
            <p className="text-[11px] font-medium tracking-[0.16em] text-slate-500 uppercase">
              {field.label}
            </p>
            <p className="mt-2 truncate text-sm font-semibold text-slate-900">
              {field.value}
            </p>
          </div>
        ))}
      </div>
    </PagePanel>
  );
}
