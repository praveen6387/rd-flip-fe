"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { grantedSelection, grantSelection } from "@/lib/photo-selection/grant";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SelectionAccess() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const grant = grantedSelection();
    if (grant?.token) {
      router.replace(`/photo-selection/${encodeURIComponent(grant.token)}`);
      return;
    }
    setReady(true);
  }, [router]);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/photo-selection/access/", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code }) });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.data?.shareToken) throw new Error(response.status === 429 ? "Too many attempts. Please wait a minute and try again." : result?.message || "Could not open photo selection.");
      grantSelection(result.data.shareToken, code);
      router.push(`/photo-selection/${encodeURIComponent(result.data.shareToken)}`);
    } catch (submitError) {
      setError(submitError.message);
      setBusy(false);
    }
  }

  if (!ready) return <main className="grid min-h-screen place-items-center bg-slate-50" />;

  return <main className="grid min-h-screen place-items-center bg-slate-50 p-6 text-slate-900">
    <form onSubmit={submit} className="w-full max-w-sm space-y-5 rounded-2xl border bg-white p-7 shadow-sm">
      <h1 className="text-2xl font-semibold">Select your photos</h1>
      <p className="text-sm text-slate-600">Enter the six-digit code shared by your studio.</p>
      <div className="space-y-2"><Label htmlFor="selection-code">Selection code</Label><Input id="selection-code" inputMode="numeric" autoComplete="off" pattern="[0-9]{6}" minLength={6} maxLength={6} required value={code} onChange={event => setCode(event.target.value.replace(/[^0-9]/g, "").slice(0, 6))} placeholder="123456" className="text-center text-xl tracking-[0.4em]" /></div>
      {error && <p role="alert" className="text-sm text-rose-600">{error}</p>}
      <Button type="submit" disabled={busy || code.length !== 6} className="w-full">{busy ? "Opening…" : "Open photos"}</Button>
    </form>
  </main>;
}
