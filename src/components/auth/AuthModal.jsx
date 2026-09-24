"use client";

import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";
import { useAuth } from "./AuthProvider";
import ForgotPasswordForm from "./_builder/ForgotPasswordForm";
import LoginForm from "./_builder/LoginForm";
import SignupForm from "./_builder/SignupForm";
import UserMenu from "./_builder/UserMenu";

export default function AuthModal({ appearance = "light" }) {
  const router = useRouter();
  const { user, logout, ready, authMode, setAuthMode } = useAuth();
  const isDark = appearance === "dark";

  function handleLogout() {
    logout();
    router.push(ROUTES.home);
  }

  if (!ready) {
    return <div className="h-10 w-28" aria-hidden />;
  }

  if (user) {
    return (
      <UserMenu
        user={user}
        onLogout={handleLogout}
        appearance={appearance}
      />
    );
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          className={
            isDark
              ? "rounded-full border border-white/25 bg-white/10 px-5 text-base text-white shadow-sm hover:bg-white/16"
              : "rounded-full border border-[#6d3d5c]/55 bg-white/70 px-5 text-base text-[#5a324c] shadow-sm hover:bg-white"
          }
          onClick={() => setAuthMode("login")}
        >
          Login
        </Button>
        <Button
          className="rounded-full bg-linear-to-r from-[#8f5678] to-[#c48a9e] px-5 text-base text-white shadow-md hover:from-[#7a4868] hover:to-[#b87a90]"
          onClick={() => setAuthMode("signup")}
        >
          Signup
        </Button>
      </div>

      <Dialog
        open={authMode !== null}
        onOpenChange={(open) => !open && setAuthMode(null)}
      >
        <DialogContent
          showCloseButton
          className="max-h-[min(92vh,880px)] gap-0 overflow-y-auto overflow-x-hidden rounded-3xl border-0 bg-white p-0 shadow-2xl ring-0 sm:max-w-3xl md:max-w-4xl"
        >
          <DialogTitle className="sr-only">
            {authMode === "signup"
              ? "Create Account"
              : authMode === "forgot"
                ? "Forgot password"
                : "Login"}
          </DialogTitle>
          {authMode === "signup" ? (
            <SignupForm
              onSwitch={() => setAuthMode("login")}
              onSuccess={() => setAuthMode(null)}
            />
          ) : authMode === "forgot" ? (
            <ForgotPasswordForm onBack={() => setAuthMode("login")} />
          ) : (
            <LoginForm
              onSwitch={() => setAuthMode("signup")}
              onForgot={() => setAuthMode("forgot")}
              onSuccess={() => setAuthMode(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
