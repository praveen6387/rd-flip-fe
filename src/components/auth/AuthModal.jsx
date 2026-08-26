"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import LoginForm from "./_builder/LoginForm";
import SignupForm from "./_builder/SignupForm";

export default function AuthModal() {
  const [mode, setMode] = useState(null);

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          className="rounded-full bg-linear-to-r from-rose-500 to-pink-500 px-5 text-base text-white shadow-md hover:from-rose-400 hover:to-pink-400"
          onClick={() => setMode("login")}
        >
          Login
        </Button>
        <Button
          className="rounded-full bg-linear-to-r from-indigo-500 to-sky-600 px-5 text-base text-white shadow-md hover:from-indigo-600 hover:to-sky-700"
          onClick={() => setMode("signup")}
        >
          Signup
        </Button>
      </div>

      <Dialog open={mode !== null} onOpenChange={(open) => !open && setMode(null)}>
        <DialogContent
          showCloseButton
          className="max-h-[min(92vh,880px)] gap-0 overflow-y-auto overflow-x-hidden rounded-3xl border-0 bg-white p-0 shadow-2xl ring-0 sm:max-w-3xl md:max-w-4xl"
        >
          <DialogTitle className="sr-only">
            {mode === "signup" ? "Create Account" : "Login"}
          </DialogTitle>
          {mode === "signup" ? (
            <SignupForm onSwitch={() => setMode("login")} />
          ) : (
            <LoginForm onSwitch={() => setMode("signup")} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
