import { createHmac } from "node:crypto";
import { cookies } from "next/headers";
import { ACCESS_COOKIE } from "@/lib/api/cookie-names";
import { deleteSelectionImage, uploadSelectionImage } from "@/lib/s3/upload";

export const runtime = "nodejs";
export const maxDuration = 60;

async function sessionToken(request) {
  const header = request.headers.get("authorization");
  if (header) return header.replace(/^Bearer\s+/i, "");
  return (await cookies()).get(ACCESS_COOKIE)?.value || "";
}

function ownedSelectionKey(albumId, key) {
  const prefix = `photo-selection/${albumId}/`;
  if (typeof key !== "string" || !key.startsWith(prefix)) return "";
  const name = key.slice(prefix.length);
  if (!name || name.includes("/") || name === "." || name === "..") return "";
  return key;
}

export async function POST(request, { params }) {
  const { albumId } = await params;
  if (!(await sessionToken(request))) {
    return Response.json({ status: "fail", message: "Please sign in again." }, { status: 401 });
  }
  let objectKey = "";
  try {
    const body = await request.formData();
    const photo = body.get("photo");
    const originalRelativePath = String(body.get("originalRelativePath") || photo?.name || "");
    if (!photo || !["image/jpeg", "image/png", "image/webp"].includes(photo.type) || !photo.size || photo.size > 10 * 1024 * 1024) throw new Error("Upload a JPG, PNG, or WebP up to 10 MB.");
    if (/[\\/]/.test(photo.name) || photo.name.length > 255) throw new Error("Invalid original filename.");
    const secret = process.env.PHOTO_SELECTION_UPLOAD_SECRET;
    if (!secret) throw new Error("Photo selection upload signing is not configured.");
    if (originalRelativePath.length > 2048 || originalRelativePath.includes("\\") || originalRelativePath.split("/").some(part => !part || part === "." || part === "..") || originalRelativePath.split("/").at(-1) !== photo.name) throw new Error("Invalid original relative path.");
    const uploaded = await uploadSelectionImage({
      buffer: Buffer.from(await photo.arrayBuffer()),
      contentType: photo.type,
      albumId,
    });
    objectKey = uploaded.key;
    const uploadExpires = Math.floor(Date.now() / 1000) + 600;
    const uploadProof = createHmac("sha256", secret).update(`${albumId}:${objectKey}:${photo.name}:${originalRelativePath}:${uploadExpires}`).digest("hex");
    return Response.json({
      status: "success",
      data: {
        name: photo.name,
        originalRelativePath,
        uploadProof,
        uploadExpires,
        objectKey,
        imageUrl: uploaded.publicUrl,
      },
    });
  } catch (error) {
    console.error("selection upload failed:", error.message);
    if (objectKey) await deleteSelectionImage(objectKey).catch(() => {});
    return Response.json({ status: "fail", message: error.message || "Photo upload failed." }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  const { albumId } = await params;
  if (!(await sessionToken(request))) {
    return Response.json({ status: "fail", message: "Please sign in again." }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  const keys = Array.isArray(body?.keys) ? body.keys : [];
  await Promise.all(keys.map((key) => deleteSelectionImage(ownedSelectionKey(albumId, key)).catch(() => {})));
  return Response.json({ status: "success", data: { removed: keys.length } });
}
