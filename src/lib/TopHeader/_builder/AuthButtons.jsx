import { Suspense } from "react";
import { AuthModal } from "@/components/auth";

export default function AuthButtons() {
  return (
    <Suspense fallback={<div className="h-10 w-28" aria-hidden />}>
      <AuthModal />
    </Suspense>
  );
}
