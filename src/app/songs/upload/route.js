import { cookies } from "next/headers";
import { ACCESS_COOKIE } from "@/lib/api/cookie-names";
import { uploadMp3ToDrive } from "@/lib/drive/upload";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request) {
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  if (!token) {
    return Response.json(
      { status: "fail", message: "Please sign in again." },
      { status: 401 }
    );
  }

  let form;
  try {
    form = await request.formData();
  } catch {
    return Response.json(
      { status: "fail", message: "Invalid upload request." },
      { status: 400 }
    );
  }

  const file = form.get("file");
  if (!(file instanceof File) || !file.size) {
    return Response.json(
      { status: "fail", message: "Missing song file." },
      { status: 400 }
    );
  }

  try {
    const uploaded = await uploadMp3ToDrive(file);
    return Response.json({ status: "success", data: uploaded });
  } catch (error) {
    return Response.json(
      {
        status: "fail",
        message:
          error.message || "Could not upload the song to Google Drive.",
      },
      { status: 400 }
    );
  }
}
