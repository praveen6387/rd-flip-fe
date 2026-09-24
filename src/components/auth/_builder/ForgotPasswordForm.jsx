"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { forgotPassword } from "@/lib/api/client/auth";
import AuthPanel, { AuthOrb } from "./AuthPanel";
import { AuthPillField } from "./AuthTextField";

export default function ForgotPasswordForm({ onBack }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sentTo, setSentTo] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "").trim().toLowerCase();

    if (!email) {
      toast.error("Email is required.");
      return;
    }

    if (!email.includes("@")) {
      toast.error("Enter a valid email.");
      return;
    }

    setIsSubmitting(true);
    try {
      await forgotPassword(email);
      setSentTo(email);
      toast.success("Password reset link sent");
    } catch (error) {
      toast.error(error.message || "Failed to send reset link");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-[420px] md:grid-cols-[0.95fr_1.15fr]">
      <AuthPanel
        title="Forgot password"
        body="Enter the email on your account. We’ll send a reset link if it matches."
      />

      <div className="relative flex flex-col justify-center overflow-hidden bg-white px-6 py-8 sm:px-10">
        <AuthOrb className="-right-8 -bottom-10 size-32 opacity-90" />

        <div className="relative z-10">
          <h3 className="text-2xl font-semibold tracking-tight text-slate-900">
            Forgot password
          </h3>

          {sentTo ? (
            <div className="mt-8 space-y-5">
              <p className="text-[15px] leading-6 text-slate-600">
                We sent a reset link to{" "}
                <span className="font-semibold text-slate-900">{sentTo}</span>.
                Check your inbox and use it within 5 minutes.
              </p>
              <Button
                type="button"
                onClick={onBack}
                className="h-12 w-full rounded-xl bg-blue-700 text-base font-semibold text-white hover:bg-blue-800"
              >
                Back to login
              </Button>
            </div>
          ) : (
            <>
              <p className="mt-2 text-sm text-slate-500">
                We’ll email you a link to choose a new password.
              </p>

              <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                <AuthPillField
                  icon={Mail}
                  id="forgot-email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="Email"
                  required
                />

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-2 h-12 w-full rounded-xl bg-blue-700 text-base font-semibold text-white hover:bg-blue-800"
                >
                  {isSubmitting ? "Sending…" : "Send reset link"}
                </Button>
              </form>
            </>
          )}

          {!sentTo ? (
            <p className="mt-6 text-center text-sm text-slate-500">
              Remembered it?{" "}
              <button
                type="button"
                className="font-semibold text-blue-600 hover:text-blue-700"
                onClick={onBack}
              >
                Login
              </button>
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
