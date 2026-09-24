"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { resetPassword } from "@/lib/api/client/auth";
import { ROUTES } from "@/lib/routes";
import AuthPanel, { AuthOrb } from "./AuthPanel";
import { AuthPillField } from "./AuthTextField";

function PasswordField({ id, name, placeholder, autoComplete }) {
  const [visible, setVisible] = useState(false);

  return (
    <AuthPillField
      icon={Lock}
      id={id}
      name={name}
      type={visible ? "text" : "password"}
      autoComplete={autoComplete}
      placeholder={placeholder}
      endAdornment={
        <button
          type="button"
          className="text-slate-400 transition hover:text-blue-600"
          onClick={() => setVisible((value) => !value)}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      }
    />
  );
}

export default function ResetPasswordForm({ token }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const hasToken = Boolean(token);

  function goToLogin() {
    router.push(ROUTES.login);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!hasToken) {
      toast.error("This reset link is invalid.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const new_password = String(formData.get("new_password") || "");
    const confirm_password = String(formData.get("confirm_password") || "");

    if (!new_password) {
      toast.error("New password is required.");
      return;
    }

    if (new_password.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }

    if (!confirm_password) {
      toast.error("Confirm new password is required.");
      return;
    }

    if (new_password !== confirm_password) {
      toast.error("New passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword({
        password_reset_token: token,
        new_password,
      });
      setDone(true);
      toast.success("Password updated");
    } catch (error) {
      toast.error(error.message || "Failed to reset password");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-2xl">
      <div className="grid min-h-[420px] md:grid-cols-[0.95fr_1.15fr]">
        <AuthPanel
          title="Reset password"
          body="Choose a new password for your account. This link works once and expires in 5 minutes."
        />

        <div className="relative flex flex-col justify-center overflow-hidden bg-white px-6 py-8 sm:px-10">
          <AuthOrb className="-right-8 -bottom-10 size-32 opacity-90" />

          <div className="relative z-10">
            <h3 className="text-2xl font-semibold tracking-tight text-slate-900">
              Reset password
            </h3>

            {!hasToken ? (
              <div className="mt-8 space-y-5">
                <p className="text-[15px] leading-6 text-slate-600">
                  This reset link is missing or invalid. Request a new one from
                  login.
                </p>
                <Button
                  type="button"
                  onClick={goToLogin}
                  className="h-12 w-full rounded-xl bg-blue-700 text-base font-semibold text-white hover:bg-blue-800"
                >
                  Back to login
                </Button>
              </div>
            ) : done ? (
              <div className="mt-8 space-y-5">
                <p className="text-[15px] leading-6 text-slate-600">
                  Your password has been updated. You can log in with the new
                  password.
                </p>
                <Button
                  type="button"
                  onClick={goToLogin}
                  className="h-12 w-full rounded-xl bg-blue-700 text-base font-semibold text-white hover:bg-blue-800"
                >
                  Login
                </Button>
              </div>
            ) : (
              <>
                <p className="mt-2 text-sm text-slate-500">
                  Enter a new password. You won’t type the token — it came from
                  the email link.
                </p>

                <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                  <PasswordField
                    id="reset-new-password"
                    name="new_password"
                    placeholder="New password"
                    autoComplete="new-password"
                  />
                  <PasswordField
                    id="reset-confirm-password"
                    name="confirm_password"
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                  />

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-2 h-12 w-full rounded-xl bg-blue-700 text-base font-semibold text-white hover:bg-blue-800"
                  >
                    {isSubmitting ? "Updating…" : "Update password"}
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
