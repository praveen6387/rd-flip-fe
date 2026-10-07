"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff, KeyRound, X } from "lucide-react";
import { toast } from "sonner";
import { changePassword } from "@/lib/api/client/auth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/cn";

function PasswordField({
  id,
  label,
  placeholder,
  value,
  onChange,
  visible,
  onToggleVisible,
  isDark,
  autoComplete,
}) {
  return (
    <div className="grid gap-1.5">
      <Label
        htmlFor={id}
        className={cn(
          "text-sm font-medium",
          isDark ? "text-slate-200" : "text-slate-700"
        )}
      >
        {label}
      </Label>
      <div
        className={cn(
          "flex h-12 items-center rounded-xl border bg-white px-1 transition-colors focus-within:ring-2",
          isDark
            ? "border-white/20 bg-white/8 focus-within:border-sky-400 focus-within:ring-sky-400/25"
            : "border-stone-300 focus-within:border-sky-500 focus-within:ring-sky-100"
        )}
      >
        <Input
          id={id}
          name={id}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={cn(
            "auth-soft-input h-full min-w-0 flex-1 rounded-xl border-0 bg-transparent px-3 py-0 text-[15px] leading-normal shadow-none outline-none focus-visible:border-0 focus-visible:ring-0 md:text-[15px]",
            isDark
              ? "text-white placeholder:text-slate-500"
              : "text-slate-900 placeholder:text-slate-400"
          )}
        />
        <button
          type="button"
          onClick={onToggleVisible}
          className={cn(
            "grid size-8 shrink-0 place-items-center rounded-full transition",
            isDark
              ? "text-slate-400 hover:bg-white/10 hover:text-white"
              : "text-slate-500 hover:bg-stone-100 hover:text-slate-800"
          )}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    </div>
  );
}

const EMPTY_FORM = {
  current_password: "",
  new_password: "",
  confirm_password: "",
};

export default function ChangePassword({ open, onOpenChange, isDark }) {
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [visible, setVisible] = useState({
    current: false,
    next: false,
    confirm: false,
  });

  useEffect(() => {
    if (!open) return;
    setForm(EMPTY_FORM);
    setVisible({ current: false, next: false, confirm: false });
  }, [open]);

  function setOpen(next) {
    onOpenChange(next);
  }

  async function handleSave(event) {
    event.preventDefault();

    const current_password = form.current_password;
    const new_password = form.new_password;

    if (!current_password) {
      toast.error("Current password is required.");
      return;
    }

    if (!new_password) {
      toast.error("New password is required.");
      return;
    }

    if (!form.confirm_password) {
      toast.error("Confirm new password is required.");
      return;
    }

    if (new_password.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }

    if (current_password === new_password) {
      toast.error("New password must be different from the current password.");
      return;
    }

    if (new_password !== form.confirm_password) {
      toast.error("New passwords do not match.");
      return;
    }

    setIsSaving(true);
    try {
      await changePassword({ current_password, new_password });
      toast.success("Password updated");
      setOpen(false);
    } catch (error) {
      toast.error(error.message || "Failed to update password");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog
        open={open}
        onOpenChange={(next) => {
          if (isSaving) return;
          setOpen(next);
        }}
      >
        <DialogContent
          showCloseButton={false}
          className={cn(
            "gap-0 overflow-hidden rounded-3xl border-0 p-0 shadow-2xl sm:max-w-lg",
            isDark ? "bg-slate-900 text-white" : "bg-white"
          )}
        >
          <div
            className={cn(
              "relative border-b px-6 pb-5 pt-6",
              isDark
                ? "border-white/10 bg-linear-to-br from-sky-500/15 via-transparent to-fuchsia-500/10"
                : "border-stone-100 bg-linear-to-br from-sky-50 via-white to-rose-50"
            )}
          >
            <button
              type="button"
              onClick={() => {
                if (!isSaving) setOpen(false);
              }}
              className={cn(
                "absolute right-4 top-4 grid size-8 place-items-center rounded-full transition",
                isDark
                  ? "bg-white/10 text-slate-300 hover:bg-white/15 hover:text-white"
                  : "bg-stone-100 text-slate-500 hover:bg-stone-200 hover:text-slate-800"
              )}
              aria-label="Close"
            >
              <X className="size-4" />
            </button>

            <div className="flex items-center gap-3 pr-10">
              <span className="grid size-11 place-items-center rounded-2xl bg-linear-to-br from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/25">
                <KeyRound className="size-5" />
              </span>
              <div>
                <DialogTitle
                  className={cn(
                    "font-serif text-xl tracking-tight",
                    isDark ? "text-white" : "text-slate-900"
                  )}
                >
                  Update password
                </DialogTitle>
                <DialogDescription
                  className={cn(
                    "mt-1 text-sm",
                    isDark ? "text-slate-400" : "text-slate-600"
                  )}
                >
                  Enter your current password, then choose a new one.
                </DialogDescription>
              </div>
            </div>
          </div>

          <form onSubmit={handleSave} className="grid gap-5 px-6 py-5">
            <div className="grid gap-3">
              <PasswordField
                id="current_password"
                label="Current password"
                placeholder="Enter current password"
                value={form.current_password}
                onChange={(value) =>
                  setForm((current) => ({ ...current, current_password: value }))
                }
                visible={visible.current}
                onToggleVisible={() =>
                  setVisible((current) => ({
                    ...current,
                    current: !current.current,
                  }))
                }
                isDark={isDark}
                autoComplete="current-password"
              />
              <PasswordField
                id="new_password"
                label="New password"
                placeholder="Enter new password"
                value={form.new_password}
                onChange={(value) =>
                  setForm((current) => ({ ...current, new_password: value }))
                }
                visible={visible.next}
                onToggleVisible={() =>
                  setVisible((current) => ({ ...current, next: !current.next }))
                }
                isDark={isDark}
                autoComplete="new-password"
              />
              <PasswordField
                id="confirm_password"
                label="Confirm new password"
                placeholder="Re-enter new password"
                value={form.confirm_password}
                onChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    confirm_password: value,
                  }))
                }
                visible={visible.confirm}
                onToggleVisible={() =>
                  setVisible((current) => ({
                    ...current,
                    confirm: !current.confirm,
                  }))
                }
                isDark={isDark}
                autoComplete="new-password"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                disabled={isSaving}
                onClick={() => setOpen(false)}
                className={cn(
                  "h-10 rounded-full px-5",
                  isDark
                    ? "border-white/15 bg-white/5 text-white hover:bg-white/10"
                    : "border-stone-300 bg-white text-slate-700"
                )}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="h-10 rounded-full bg-linear-to-r from-sky-600 to-indigo-600 px-5 text-white shadow-none hover:from-sky-500 hover:to-indigo-500"
              >
                {isSaving ? "Updating…" : "Update password"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
  );
}
