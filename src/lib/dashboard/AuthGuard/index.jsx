"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { hasAccessToken } from "@/lib/api/client/auth";
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
      <div className="flex min-h-full flex-1 items-center justify-center bg-[#f4efe6]">
        <div className="size-9 animate-spin rounded-full border-2 border-stone-300 border-t-sky-500" />
      </div>
    );
  }

  return children;
}
