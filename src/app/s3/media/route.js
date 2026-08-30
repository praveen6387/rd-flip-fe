import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getS3Client, getS3Config } from "@/lib/s3/config";
import { isAllowedS3MediaUrl, s3ObjectKeyFromUrl } from "@/lib/s3/media";

export const runtime = "nodejs";

export async function GET(request) {
  const src = request.nextUrl.searchParams.get("src");
  if (!isAllowedS3MediaUrl(src)) {
    return new Response("Invalid media URL", { status: 400 });
  }

  const config = getS3Config();
  if (!config) {
    return new Response("S3 is not configured", { status: 500 });
  }

  let key;
  try {
    key = s3ObjectKeyFromUrl(src);
  } catch {
    return new Response("Invalid media URL", { status: 400 });
  }

  if (!key) {
    return new Response("Missing object key", { status: 400 });
  }

  try {
    const result = await getS3Client(config).send(
      new GetObjectCommand({
        Bucket: config.bucket,
        Key: key,
      })
    );
    const body = await result.Body.transformToByteArray();

    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": result.ContentType || "image/jpeg",
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch {
    return new Response("Could not load image", { status: 403 });
  }
}
