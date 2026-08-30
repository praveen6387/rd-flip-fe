export function isAllowedS3MediaUrl(raw) {
  if (!raw || typeof raw !== "string") return false;

  let url;
  try {
    url = new URL(raw);
  } catch {
    return false;
  }

  if (url.protocol !== "https:") return false;

  const bucket = process.env.AWS_S3_BUCKET || "";
  const host = url.hostname;

  if (bucket) {
    return (
      host === `${bucket}.s3.amazonaws.com` ||
      (host.startsWith(`${bucket}.s3.`) && host.endsWith(".amazonaws.com")) ||
      (host.startsWith("s3.") && host.endsWith(".amazonaws.com"))
    );
  }

  return host.includes("s3") && host.endsWith(".amazonaws.com");
}

export function s3ObjectKeyFromUrl(raw) {
  const url = new URL(raw);
  const bucket = process.env.AWS_S3_BUCKET || "";
  let key = decodeURIComponent(url.pathname.replace(/^\/+/, ""));

  if (bucket && key.startsWith(`${bucket}/`)) {
    key = key.slice(bucket.length + 1);
  }

  return key;
}

export function s3DisplaySrc(url) {
  if (!url) return "";
  return `/s3/media?src=${encodeURIComponent(url)}`;
}
