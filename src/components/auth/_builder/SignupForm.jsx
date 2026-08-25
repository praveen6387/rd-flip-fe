"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignupForm({ onSwitch }) {
  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
      }}
    >
      <div className="grid gap-2">
        <Label htmlFor="signup-name">Name</Label>
        <Input id="signup-name" type="text" placeholder="Your name" required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="signup-email">Email</Label>
        <Input id="signup-email" type="email" placeholder="you@example.com" required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="signup-password">Password</Label>
        <Input id="signup-password" type="password" required />
      </div>
      <Button type="submit" className="w-full">
        Create account
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <button type="button" className="font-medium text-foreground underline-offset-4 hover:underline" onClick={onSwitch}>
          Login
        </button>
      </p>
    </form>
  );
}
