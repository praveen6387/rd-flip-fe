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
