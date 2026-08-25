"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import LoginForm from "./_builder/LoginForm";
import SignupForm from "./_builder/SignupForm";

const COPY = {
  login: {
    title: "Login",
    description: "Welcome back. Enter your details to continue.",
  },
  signup: {
    title: "Signup",
    description: "Open the dashboard. One free credit lasts 7 days.",
  },
};

export default function AuthModal() {
  const [mode, setMode] = useState(null);
  const copy = mode ? COPY[mode] : COPY.login;

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="border-white/25 bg-transparent text-white hover:bg-white/10 hover:text-white"
          onClick={() => setMode("login")}
        >
          Login
        </Button>
        <Button
          size="sm"
          className="bg-linear-to-r from-[#d4af37] to-[#f0c14b] text-black hover:from-[#e0bc4a] hover:to-[#f5d06a]"
          onClick={() => setMode("signup")}
        >
          Signup
        </Button>
      </div>

      <Dialog open={mode !== null} onOpenChange={(open) => !open && setMode(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{copy.title}</DialogTitle>
            <DialogDescription>{copy.description}</DialogDescription>
          </DialogHeader>
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
