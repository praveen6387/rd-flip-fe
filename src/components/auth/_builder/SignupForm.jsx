"use client";

import { useState } from "react";
import { CalendarDays, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthPanel, { AuthOrb } from "./AuthPanel";

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

function SoftInput({ className = "", ...props }) {
  return (
    <Input
      className={`h-11 rounded-xl border-slate-200/80 bg-slate-50 text-base text-slate-900 placeholder:text-slate-400 focus-visible:border-blue-300 focus-visible:bg-white focus-visible:ring-blue-200/70 ${className}`}
      {...props}
    />
  );
}

export default function SignupForm({ onSwitch }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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
            viewer. You get <span className="font-semibold">1 free credit</span>{" "}
            usable for up to <span className="font-semibold">7 days</span>. A
            flipbook created with this credit lasts{" "}
            <span className="font-semibold">30 days</span> if you do not
            recharge.
          </div>

          <form
            className="mt-5 grid gap-3.5 sm:grid-cols-2"
            onSubmit={(event) => event.preventDefault()}
          >
            <Field id="signup-first-name" label="First Name" required>
              <SoftInput id="signup-first-name" placeholder="First name" required />
            </Field>
            <Field id="signup-last-name" label="Last Name" required>
              <SoftInput id="signup-last-name" placeholder="Last name" required />
            </Field>

            <Field id="signup-studio" label="Studio Name" required>
              <SoftInput
                id="signup-studio"
                placeholder="Enter studio name"
                required
              />
            </Field>
            <Field id="signup-email" label="Email Address" required>
              <SoftInput
                id="signup-email"
                type="email"
                placeholder="you@studio.in"
                required
              />
            </Field>

            <Field id="signup-phone" label="Phone" required>
              <SoftInput
                id="signup-phone"
                type="tel"
                inputMode="tel"
                placeholder="Phone number"
                required
              />
            </Field>
            <Field id="signup-dob" label="Date of Birth" required>
              <div className="relative">
                <SoftInput
                  id="signup-dob"
                  type="date"
                  required
                  className="pr-10"
                />
                <CalendarDays className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-slate-400" />
              </div>
            </Field>

            <Field id="signup-password" label="Password" required>
              <div className="relative">
                <SoftInput
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create password"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </Field>
            <Field id="signup-confirm" label="Confirm Password" required>
              <div className="relative">
                <SoftInput
                  id="signup-confirm"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Re-enter password"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  onClick={() => setShowConfirm((value) => !value)}
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </Field>

            <div className="sm:col-span-2">
              <Button
                type="button"
                className="mt-1 h-11 w-full rounded-xl bg-linear-to-r from-blue-600 to-sky-500 text-base font-semibold text-white hover:from-blue-700 hover:to-sky-600"
              >
                Create account
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
