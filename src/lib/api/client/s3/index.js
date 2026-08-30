import { formatFailResult } from "@/lib/api/error";

const UPLOAD_URL = "/s3/upload";
const UPLOAD_CONCURRENCY = 3;

const ZONE_ORDER = ["front", "middle", "back"];

export function orderedCoverItems(covers) {
  return ZONE_ORDER.flatMap((cover_type) =>
    (covers[cover_type] || []).map((item) => ({ item, cover_type }))
  );
}

async function uploadOne({ item, cover_type }, index, batch) {
  const form = new FormData();
  form.append("file", item.blob, "photo.jpg");
  form.append("cover_type", cover_type);
  form.append("batch", batch);
  form.append("index", String(index + 1));

  const response = await fetch(UPLOAD_URL, {
    method: "POST",
    body: form,
  });
  const result = await response.json().catch(() => null);

  if (!response.ok || result?.status === "fail") {
    throw new Error(formatFailResult(result, "Photo upload to S3 failed."));
  }

  return result.data;
}

async function runPool(items, worker) {
  const results = new Array(items.length);
  let cursor = 0;

  async function run() {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await worker(items[index], index);
    }
  }

  const pool = Math.min(UPLOAD_CONCURRENCY, items.length);
  await Promise.all(Array.from({ length: pool }, run));
  return results;
}

export async function uploadCoverImages(covers, onProgress) {
  const sequence = orderedCoverItems(covers);
  if (!sequence.length) {
    throw new Error("Add at least one photo.");
  }

  const batch = crypto.randomUUID();
  let done = 0;
  onProgress?.({ current: 0, total: sequence.length });

  const uploaded = await runPool(sequence, async (entry, index) => {
    const result = await uploadOne(entry, index, batch);
    done += 1;
    onProgress?.({ current: done, total: sequence.length });
    return result;
  });

  return sequence.map((entry, index) => ({
    page_number: index + 1,
    image_url: uploaded[index].publicUrl,
    cover_type: entry.cover_type,
  }));
}
