"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Loader2, Lock } from "lucide-react";
import GoogleTranslate from "@/components/GoogleTranslate";
import { grantedSelection, grantSelection } from "@/lib/photo-selection/grant";

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

  if (!ready) return <main className="grid min-h-screen place-items-center bg-stone-950" />;
  return (
    <main className="relative grid min-h-screen place-items-center bg-stone-950 p-4">
      <div className="absolute top-4 right-4 z-10">
        <GoogleTranslate appearance="dark" />
      </div>
      <form onSubmit={submit} className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-2xl">
        <div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl border border-amber-200 bg-amber-50 text-amber-700"><KeyRound className="size-7" /></div>
        <h1 className="font-heading text-2xl font-bold text-stone-900">Private photo gallery</h1>
        <p className="mt-1 mb-6 text-xs text-stone-500">Enter the six-digit code shared by your studio. You will only be asked once in this tab.</p>
        <input id="selection-code" inputMode="numeric" autoComplete="off" pattern="[0-9]{6}" minLength={6} maxLength={6} required value={code} onChange={(event) => setCode(event.target.value.replace(/[^0-9]/g, "").slice(0, 6))} placeholder="Enter access code" className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-center font-mono text-lg tracking-[0.4em] outline-none focus:ring-2 focus:ring-amber-500" />
        {error ? <p role="alert" className="mt-3 text-sm text-rose-600">{error}</p> : null}
        <button type="submit" disabled={busy || code.length !== 6} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-700 py-3 text-sm font-semibold text-white disabled:opacity-50">{busy ? <Loader2 className="size-4 animate-spin" /> : <Lock className="size-4" />}Unlock gallery</button>
      </form>
    </main>
  );
}
