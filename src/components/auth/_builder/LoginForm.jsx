"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Phone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/lib/routes";
import { useAuth } from "../AuthProvider";
import AuthPanel, { AuthOrb } from "./AuthPanel";

export default function LoginForm({ onSwitch, onSuccess }) {
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const identifier = String(formData.get("identifier") || "").trim();
    const password = String(formData.get("password") || "");

    const payload = { password };
    if (identifier.includes("@")) {
      payload.email = identifier;
    } else {
      payload.phone = identifier;
    }

    setIsSubmitting(true);

    try {
      await login(payload);
      toast.success("Login successful");
      onSuccess?.();
      router.push(ROUTES.dashboard);
    } catch (error) {
      toast.error(error.message || "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-[420px] md:grid-cols-[0.95fr_1.15fr]">
      <AuthPanel
        title="Welcome back"
        body="Your flipbooks are waiting. Let’s continue creating something beautiful."
      />

      <div className="relative flex flex-col justify-center overflow-hidden bg-white px-6 py-8 sm:px-10">
        <AuthOrb className="-right-8 -bottom-10 size-32 opacity-90" />

        <div className="relative z-10">
          <h3 className="text-2xl font-semibold tracking-tight text-slate-900">
            Login
          </h3>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <label className="flex h-12 items-center gap-3 rounded-full bg-slate-100 px-4 transition focus-within:bg-slate-50 focus-within:ring-2 focus-within:ring-blue-200">
              <Phone className="size-4 shrink-0 text-slate-400" />
              <Input
                id="login-identifier"
                name="identifier"
                type="text"
                inputMode="email"
                placeholder="Phone or email"
                required
                className="h-auto border-0 bg-transparent p-0 text-base text-slate-900 shadow-none placeholder:text-slate-400 focus-visible:ring-0"
              />
            </label>

            <label className="flex h-12 items-center gap-3 rounded-full bg-slate-100 px-4 transition focus-within:bg-slate-50 focus-within:ring-2 focus-within:ring-blue-200">
              <Lock className="size-4 shrink-0 text-slate-400" />
              <Input
                id="login-password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                required
                className="h-auto flex-1 border-0 bg-transparent p-0 text-base text-slate-900 shadow-none placeholder:text-slate-400 focus-visible:ring-0"
              />
              <button
                type="button"
                className="shrink-0 text-slate-400 transition hover:text-blue-600"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </label>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 h-12 w-full rounded-xl bg-blue-700 text-base font-semibold text-white hover:bg-blue-800"
            >
              {isSubmitting ? "Logging in…" : "Login"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <button
              type="button"
              className="font-semibold text-blue-600 hover:text-blue-700"
              onClick={onSwitch}
            >
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
