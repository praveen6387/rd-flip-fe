import { S3Client } from "@aws-sdk/client-s3";

export function getS3Config() {
  const region = process.env.AWS_REGION || "";
  const bucket = process.env.AWS_S3_BUCKET || "";
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID || "";
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || "";
  const publicBaseUrl = (process.env.AWS_S3_PUBLIC_BASE_URL || "").replace(
    /\/$/,
    ""
  );

  if (!region || !bucket || !accessKeyId || !secretAccessKey) {
    return null;
  }

  return { region, bucket, accessKeyId, secretAccessKey, publicBaseUrl };
}

let client;

export function getS3Client(config) {
  if (!client) {
    client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      requestChecksumCalculation: "WHEN_REQUIRED",
    });
  }
  return client;
}

export function publicObjectUrl(config, key) {
  if (config.publicBaseUrl) {
    return `${config.publicBaseUrl}/${key}`;
  }

  return `https://${config.bucket}.s3.${config.region}.amazonaws.com/${key}`;
}
