"use client";

import { AuthProvider } from "@/components/auth";
import NavProgress from "@/lib/dashboard/_builder/NavProgress";
import { LandingThemeProvider } from "@/lib/landing/ThemeProvider";

export default function Providers({ children }) {
  return (
    <LandingThemeProvider>
      <AuthProvider>
        {children}
        <NavProgress />
      </AuthProvider>
    </LandingThemeProvider>
  );
}
