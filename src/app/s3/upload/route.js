import { cookies } from "next/headers";
import { ACCESS_COOKIE } from "@/lib/api/cookie-names";
import { uploadJpegToS3 } from "@/lib/s3/upload";

export const runtime = "nodejs";

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
  const coverType = String(form.get("cover_type") || "");
  const batch = String(form.get("batch") || "");
  const index = Number(form.get("index") || 0);

  if (!(file instanceof File) || !file.size) {
    return Response.json(
      { status: "fail", message: "Missing photo file." },
      { status: 400 }
    );
  }

  if (!batch) {
    return Response.json(
      { status: "fail", message: "Missing upload batch." },
      { status: 400 }
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const uploaded = await uploadJpegToS3({
      buffer,
      coverType,
      batch,
      index,
    });
    return Response.json({ status: "success", data: uploaded });
  } catch (error) {
    return Response.json(
      {
        status: "fail",
        message: error.message || "Could not upload photo to S3.",
      },
      { status: 400 }
    );
  }
}
