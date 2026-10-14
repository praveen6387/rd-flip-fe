import { createHmac } from "node:crypto";
import { Readable } from "node:stream";
import { cookies } from "next/headers";
import { ACCESS_COOKIE } from "@/lib/api/cookie-names";
import { backendUrl } from "@/lib/api/endpoints";
import { getOwnerDriveClient } from "@/lib/drive/upload";
export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request, { params }) {
  const { albumId } = await params;
  const token = request.headers.get("authorization") || `Bearer ${(await cookies()).get(ACCESS_COOKIE)?.value || ""}`;
  const headers = { Authorization: token };
  const endpoint = backendUrl(`/api/photo-selection/${encodeURIComponent(albumId)}/`);
  const check = await fetch(endpoint, { headers, cache: "no-store" });
  const checked = await check.json().catch(() => null);
  if (!check.ok) return Response.json(checked, { status: check.status });
  if (checked?.data?.album?.status === "selected") return Response.json({ message: "Submitted folders cannot be changed." }, { status: 409 });
  let drive, fileId;
  try {
    const body = await request.formData();
    const photo = body.get("photo");
    const originalRelativePath = String(body.get("originalRelativePath") || photo?.name || "");
    if (!photo || !["image/jpeg", "image/png", "image/webp"].includes(photo.type) || !photo.size || photo.size > 10 * 1024 * 1024) throw new Error("Upload a JPG, PNG, or WebP up to 10 MB.");
    if (/[\\/]/.test(photo.name) || photo.name.length > 255) throw new Error("Invalid original filename.");
    const secret = process.env.PHOTO_SELECTION_UPLOAD_SECRET;
    if (!secret) throw new Error("Photo selection upload signing is not configured.");
    if (originalRelativePath.length > 2048 || originalRelativePath.includes("\\") || originalRelativePath.split("/").some(part => !part || part === "." || part === "..") || originalRelativePath.split("/").at(-1) !== photo.name) throw new Error("Invalid original relative path.");
    drive = getOwnerDriveClient();
    const folderId = process.env.GOOGLE_DRIVE_PHOTO_SELECTION_FOLDER_ID || process.env.GOOGLE_DRIVE_FOLDER_ID;
    if (!folderId) throw new Error("Connect Google Drive photo storage before uploading.");
    const uploaded = await drive.files.create({ requestBody: { name: `${albumId}-${photo.name}`, parents: [folderId] }, media: { mimeType: photo.type, body: Readable.from(Buffer.from(await photo.arrayBuffer())) }, fields: "id" });
    fileId = uploaded.data.id;
    const uploadExpires = Math.floor(Date.now() / 1000) + 600;
    const uploadProof = createHmac("sha256", secret).update(`${albumId}:${fileId}:${photo.name}:${originalRelativePath}:${uploadExpires}`).digest("hex");
    const saved = await fetch(endpoint, { method: "POST", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify({ name: photo.name, originalRelativePath, uploadProof, uploadExpires, driveFileId: fileId, imageUrl: `/selection-media/${fileId}` }) });
    const result = await saved.json();
    if (!saved.ok) throw new Error(result.message || "Could not save uploaded photo.");
    return Response.json(result);
  } catch (error) {
    if (fileId && drive) await drive.files.delete({ fileId }).catch(() => {});
    return Response.json({ status: "fail", message: error.message || "Photo upload failed." }, { status: 400 });
  }
}
