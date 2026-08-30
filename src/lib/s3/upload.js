import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getS3Client, getS3Config, publicObjectUrl } from "./config";

const COVER_TYPES = new Set(["front", "middle", "back"]);

export async function uploadJpegToS3({ buffer, coverType, batch, index }) {
  const config = getS3Config();
  if (!config) {
    throw new Error(
      "S3 is not configured. Add AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, and AWS_S3_BUCKET."
    );
  }

  if (!COVER_TYPES.has(coverType)) {
    throw new Error("Each photo needs a front, middle, or back cover type.");
  }

  const key = `flipbooks/${batch}/${coverType}-${String(index).padStart(3, "0")}.jpg`;
  const s3 = getS3Client(config);

  await s3.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: buffer,
      ContentType: "image/jpeg",
    })
  );

  return {
    key,
    publicUrl: publicObjectUrl(config, key),
    cover_type: coverType,
  };
}
