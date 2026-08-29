"use client";

import { useAuth } from "@/components/auth";

export default function Overview() {
  const { user } = useAuth();
  const name = user?.first_name || "there";

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-indigo-600">Welcome back</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
          Hi, {name}
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
          This is your studio dashboard. More tools and tabs will live here
          soon — flipbooks, credits, and branding.
        </p>
      </div>
    </section>
  );
}
