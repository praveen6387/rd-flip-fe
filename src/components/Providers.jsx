"use client";

import { AuthProvider } from "@/components/auth";

export default function Providers({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}
