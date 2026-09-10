"use client";

import { AuthProvider } from "@/components/auth";
import NavProgress from "@/lib/dashboard/_builder/NavProgress";

export default function Providers({ children }) {
  return (
    <AuthProvider>
      {children}
      <NavProgress />
    </AuthProvider>
  );
}
