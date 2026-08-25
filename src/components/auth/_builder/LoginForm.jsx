"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginForm({ onSwitch }) {
  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
      }}
    >
      <div className="grid gap-2">
        <Label htmlFor="login-email">Email</Label>
        <Input id="login-email" type="email" placeholder="you@example.com" required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="login-password">Password</Label>
        <Input id="login-password" type="password" required />
      </div>
      <Button type="submit" className="w-full">
        Login
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Need an account?{" "}
        <button type="button" className="font-medium text-foreground underline-offset-4 hover:underline" onClick={onSwitch}>
          Signup
        </button>
      </p>
    </form>
  );
}
