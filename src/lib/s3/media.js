/** Use API image URL as-is (keeps S3 signed query string). */
export function s3DisplaySrc(url) {
  if (!url) return "";
  return String(url);
}
