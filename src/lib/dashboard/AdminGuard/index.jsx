"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth";
import { isAdminUser } from "@/lib/auth/roles";
import { ROUTES } from "@/lib/routes";

export default function AdminGuard({ children }) {
  const router = useRouter();
  const { user, ready, verified } = useAuth();

  useEffect(() => {
    if (!ready || !verified) return;
    if (!isAdminUser(user)) {
      router.replace(ROUTES.dashboard);
    }
  }, [ready, verified, user, router]);

  if (!ready || !verified || !isAdminUser(user)) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center">
        <div className="size-9 animate-spin rounded-full border-2 border-stone-300 border-t-sky-500" />
      </div>
    );
  }

  return children;
}
