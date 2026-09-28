import { cookies } from "next/headers";
import { ACCESS_COOKIE } from "@/lib/api/cookie-names";
import { completeDriveUpload } from "@/lib/drive/upload";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request) {
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  if (!token) {
    return Response.json(
      { status: "fail", message: "Please sign in again." },
      { status: 401 }
    );
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return Response.json(
      { status: "fail", message: "Invalid upload request." },
      { status: 400 }
    );
  }

  try {
    const uploaded = await completeDriveUpload(payload?.fileId, payload?.name);
    return Response.json({ status: "success", data: uploaded });
  } catch (error) {
    return Response.json(
      {
        status: "fail",
        message:
          error.message || "Could not finish the song upload to Google Drive.",
      },
      { status: 400 }
    );
  }
}
