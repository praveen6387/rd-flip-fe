"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Phone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";
import { useAuth } from "../AuthProvider";
import AuthPanel, { AuthOrb } from "./AuthPanel";
import { AuthPillField } from "./AuthTextField";

export default function LoginForm({ onSwitch, onForgot, onSuccess }) {
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
            <AuthPillField
              icon={Phone}
              id="login-identifier"
              name="identifier"
              type="text"
              inputMode="email"
              placeholder="Phone or email"
              required
            />

            <AuthPillField
              icon={Lock}
              id="login-password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              required
              endAdornment={
                <button
                  type="button"
                  className="text-slate-400 transition hover:text-blue-600"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              }
            />

            <div className="flex justify-end">
              <button
                type="button"
                className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                onClick={onForgot}
              >
                Forgot password?
              </button>
            </div>

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
