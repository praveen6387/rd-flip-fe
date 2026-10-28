import { createHmac } from "node:crypto";
import { cookies } from "next/headers";
import { ACCESS_COOKIE } from "@/lib/api/cookie-names";
import { backendUrl } from "@/lib/api/endpoints";
import { getS3Config } from "@/lib/s3/config";

export const runtime = "nodejs";

export async function GET(request) {
  const authorization = request.headers.get("authorization") || `Bearer ${(await cookies()).get(ACCESS_COOKIE)?.value || ""}`;
  const headers = { Authorization: authorization, "Content-Type": "application/json" };
  try {
    const me = await fetch(backendUrl("/api/auth/me/"), { headers, cache: "no-store" });
    const profile = await me.json().catch(() => null);
    if (!me.ok) {
      return Response.json(
        profile || { status: "fail", message: "Could not verify your studio session." },
        { status: me.status }
      );
    }
    const secret = process.env.PHOTO_SELECTION_UPLOAD_SECRET;
    if (!secret) throw new Error("Photo selection upload signing is not configured on the frontend. Contact the studio administrator.");
    const userId = profile?.data?.user?.user_id;
    if (!userId) throw new Error("Could not verify studio identity.");
    const expires = Math.floor(Date.now() / 1000) + 60;
    const proof = createHmac("sha256", secret).update(`selection-storage:${userId}:${expires}`).digest("hex");
    const signing = await fetch(backendUrl("/api/photo-selection/storage-check/"), { method: "POST", headers, body: JSON.stringify({ expires, proof }), cache: "no-store" });
    const checked = await signing.json().catch(() => null);
    if (signing.status === 404) {
      return Response.json(
        { status: "fail", message: "Photo upload is not available on this API server yet. It is still running the previous storage service." },
        { status: 503, headers: { "Cache-Control": "no-store" } }
      );
    }
    if (!signing.ok) {
      return Response.json(
        checked || { status: "fail", message: "Could not verify photo storage." },
        { status: signing.status }
      );
    }
    if (!getS3Config()) {
      throw new Error("Photo storage is not configured. Add the S3 bucket settings and try again.");
    }
    return Response.json({ status: "success", data: { ready: true } }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return Response.json(
      { status: "fail", message: error.message || "Photo storage is unavailable." },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}
