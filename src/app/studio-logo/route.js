import { cookies } from "next/headers";
import { ACCESS_COOKIE } from "@/lib/api/cookie-names";
import { uploadStudioLogo } from "@/lib/s3/upload";

export const runtime = "nodejs";
export const maxDuration = 60;

async function sessionToken(request) {
  const header = request.headers.get("authorization");
  if (header) return header.replace(/^Bearer\s+/i, "");
  return (await cookies()).get(ACCESS_COOKIE)?.value || "";
}

export async function POST(request) {
  const token = await sessionToken(request);
  if (!token) {
    return Response.json({ status: "fail", message: "Please sign in again." }, { status: 401 });
  }
  const origin = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");
  if (!origin) {
    return Response.json({ status: "fail", message: "API is not configured." }, { status: 500 });
  }
  try {
    const profile = await fetch(`${origin}/api/auth/me/`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
    const account = await profile.json().catch(() => null);
    const userId = account?.data?.user?.user_id;
    if (!profile.ok || !userId) {
      return Response.json({ status: "fail", message: "Please sign in again." }, { status: 401 });
    }
    const body = await request.formData();
    const logo = body.get("logo");
    if (!logo || !["image/jpeg", "image/png", "image/webp"].includes(logo.type) || !logo.size || logo.size > 2 * 1024 * 1024) {
      throw new Error("Upload a JPG, PNG, or WebP logo up to 2 MB.");
    }
    const uploaded = await uploadStudioLogo({
      buffer: Buffer.from(await logo.arrayBuffer()),
      contentType: logo.type,
      userId: String(userId),
    });
    return Response.json({ status: "success", data: { imageUrl: uploaded.publicUrl } });
  } catch (error) {
    return Response.json({ status: "fail", message: error.message || "Logo upload failed." }, { status: 400 });
  }
}
