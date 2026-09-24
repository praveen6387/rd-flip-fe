"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/lib/routes";
import { useAuth } from "../AuthProvider";
import AuthPanel, { AuthOrb } from "./AuthPanel";
import { AuthPillField } from "./AuthTextField";

function Field({ id, label, required, children }) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id} className="text-sm font-medium text-slate-600">
        {label}
        {required ? <span className="ml-0.5 text-rose-500">*</span> : null}
      </Label>
      {children}
    </div>
  );
}

export default function SignupForm({ onSwitch, onSuccess }) {
  const router = useRouter();
  const { signup } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") || "");
    const confirmPassword = String(formData.get("confirm_password") || "");

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    const payload = {
      first_name: String(formData.get("first_name") || "").trim(),
      last_name: String(formData.get("last_name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      password,
      dob: String(formData.get("dob") || "").trim() || undefined,
      studio_name: String(formData.get("studio_name") || "").trim() || undefined,
    };

    setIsSubmitting(true);

    try {
      await signup(payload);
      toast.success("Signup successful");
      onSuccess?.();
      router.push(ROUTES.dashboard);
    } catch (error) {
      toast.error(error.message || "Signup failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-[560px] md:grid-cols-[0.85fr_1.35fr]">
      <AuthPanel
        title="Welcome"
        body="Create your account to get started. Create, brand, and share digital flipbooks instantly. One tap access. No app needed."
      />

      <div className="relative flex flex-col justify-center overflow-hidden bg-white px-5 py-7 sm:px-8 sm:py-8">
        <AuthOrb className="-right-8 -bottom-10 size-32 opacity-90" />

        <div className="relative z-10">
          <h3 className="text-2xl font-semibold tracking-tight text-slate-900">
            Create Account
          </h3>

          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-sm leading-6 text-emerald-800">
            Your Studio Name will be visible on the QR code and the flipbook
            viewer. You get{" "}
            <span className="font-semibold">5 free credits</span> usable for up
            to <span className="font-semibold">7 days</span>. Flipbooks created
            with these credits last{" "}
            <span className="font-semibold">30 days</span> if you do not
            recharge.
          </div>

          <form
            className="mt-5 grid gap-3.5 sm:grid-cols-2"
            onSubmit={handleSubmit}
          >
            <Field id="signup-first-name" label="First Name" required>
              <AuthPillField
                id="signup-first-name"
                name="first_name"
                placeholder="First name"
                required
              />
            </Field>
            <Field id="signup-last-name" label="Last Name" required>
              <AuthPillField
                id="signup-last-name"
                name="last_name"
                placeholder="Last name"
                required
              />
            </Field>

            <Field id="signup-phone" label="Phone" required>
              <AuthPillField
                id="signup-phone"
                name="phone"
                type="tel"
                inputMode="tel"
                placeholder="Phone number"
                required
              />
            </Field>
            <Field id="signup-email" label="Email Address" required>
              <AuthPillField
                id="signup-email"
                name="email"
                type="email"
                placeholder="you@studio.in"
                required
              />
            </Field>

            <Field id="signup-studio" label="Studio Name" required>
              <AuthPillField
                id="signup-studio"
                name="studio_name"
                placeholder="Enter studio name"
                required
              />
            </Field>

            <Field id="signup-dob" label="Date of Birth" required>
              <AuthPillField
                id="signup-dob"
                name="dob"
                type="date"
                required
                endAdornment={
                  <CalendarDays className="pointer-events-none size-4 text-slate-400" />
                }
              />
            </Field>

            <Field id="signup-password" label="Password" required>
              <AuthPillField
                id="signup-password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create password"
                minLength={8}
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
            </Field>
            <Field id="signup-confirm" label="Confirm Password" required>
              <AuthPillField
                id="signup-confirm"
                name="confirm_password"
                type={showConfirm ? "text" : "password"}
                placeholder="Re-enter password"
                minLength={8}
                required
                endAdornment={
                  <button
                    type="button"
                    className="text-slate-400 transition hover:text-blue-600"
                    onClick={() => setShowConfirm((value) => !value)}
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                  >
                    {showConfirm ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                }
              />
            </Field>

            <div className="sm:col-span-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="mt-1 h-11 w-full rounded-xl bg-linear-to-r from-blue-600 to-sky-500 text-base font-semibold text-white hover:from-blue-700 hover:to-sky-600"
              >
                {isSubmitting ? "Creating account…" : "Create account"}
              </Button>
            </div>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <button
              type="button"
              className="font-semibold text-blue-600 hover:text-blue-700"
              onClick={onSwitch}
            >
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
