export function formatFailResult(result, fallback = "Request failed") {
  if (!result || typeof result !== "object") return fallback;

  const chunks = [result.message, result.details, result.detail].filter(
    (value) => typeof value === "string" && value.trim()
  );
  const unique = [...new Set(chunks.map((value) => value.trim()))];

  if (
    result.data &&
    typeof result.data === "object" &&
    !Array.isArray(result.data)
  ) {
    const fields = Object.entries(result.data)
      .filter(([, value]) => value != null && value !== "")
      .map(([key, value]) =>
        `${key}: ${Array.isArray(value) ? value.join(", ") : String(value)}`
      )
      .join(" · ");
    if (fields) unique.push(fields);
  }

  return unique.join(" — ") || fallback;
}

export function parseS3Error(text) {
  if (!text) return "";
  const code = text.match(/<Code>([^<]+)<\/Code>/i)?.[1];
  const message = text.match(/<Message>([^<]+)<\/Message>/i)?.[1];
  if (code && message) return `${code}: ${message}`;
  if (message) return message;
  return text.slice(0, 180);
}
