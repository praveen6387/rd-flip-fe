"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { hasAccessToken } from "@/api/client/auth";
import { useAuth } from "@/components/auth";
import { ROUTES } from "@/lib/routes";

export default function AuthGuard({ children }) {
  const router = useRouter();
  const { ready } = useAuth();

  useEffect(() => {
    if (!ready) return;
    if (!hasAccessToken()) {
      router.replace(ROUTES.login);
    }
  }, [ready, router]);

  if (!ready || !hasAccessToken()) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center bg-slate-50">
        <div className="size-8 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
      </div>
    );
  }

  return children;
}
