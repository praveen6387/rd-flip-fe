import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
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
      CacheControl: "private, max-age=31536000",
    })
  );

  return {
    key,
    publicUrl: publicObjectUrl(config, key),
    cover_type: coverType,
  };
}

const SELECTION_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function uploadSelectionImage({ buffer, contentType, albumId }) {
  const config = getS3Config();
  if (!config) {
    throw new Error(
      "S3 is not configured. Add AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, and AWS_S3_BUCKET."
    );
  }
  const extension = SELECTION_TYPES[contentType];
  if (!extension) throw new Error("Upload a JPG, PNG, or WebP.");
  if (!/^[a-zA-Z0-9-]+$/.test(albumId)) throw new Error("Invalid selection folder.");

  const key = `photo-selection/${albumId}/${crypto.randomUUID()}.${extension}`;
  const s3 = getS3Client(config);
  await s3.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: "private, max-age=31536000",
    })
  );
  return { key, publicUrl: publicObjectUrl(config, key) };
}

export async function deleteSelectionImage(key) {
  const config = getS3Config();
  if (!config || !key) return;
  await getS3Client(config).send(
    new DeleteObjectCommand({ Bucket: config.bucket, Key: key })
  );
}
