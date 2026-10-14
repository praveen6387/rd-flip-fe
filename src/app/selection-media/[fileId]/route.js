import { Readable } from "node:stream";
import { cookies } from "next/headers";
import { ACCESS_COOKIE } from "@/lib/api/cookie-names";
import { backendUrl } from "@/lib/api/endpoints";
import { getOwnerDriveClient } from "@/lib/drive/upload";
export const runtime = "nodejs";
export async function GET(request, { params }) {
  const { fileId } = await params;
  if (!/^[a-zA-Z0-9_-]+$/.test(fileId)) return new Response("Not found", { status: 404 });
  const share = new URL(request.url).searchParams.get("share");
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  const endpoint = share ? `/api/photo-selection/public/${encodeURIComponent(share)}/` : "/api/photo-selection/";
  const response = await fetch(backendUrl(endpoint), { headers: token && !share ? { Authorization: `Bearer ${token}` } : {}, cache: "no-store" });
  const result = await response.json().catch(() => null);
  const albums = share ? [result?.data?.album] : result?.data?.albums || [];
  if (!response.ok || !albums.some(a => a?.photos?.some(p => p.imageUrl === `/selection-media/${fileId}`))) return new Response("Not found", { status: 404 });
  try {
    const drive = getOwnerDriveClient();
    const meta = await drive.files.get({ fileId, fields: "mimeType" });
    const image = await drive.files.get({ fileId, alt: "media" }, { responseType: "stream" });
    return new Response(Readable.toWeb(image.data), { headers: { "Content-Type": meta.data.mimeType || "image/jpeg", "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
  } catch { return new Response("Photo unavailable", { status: 404 }); }
}
