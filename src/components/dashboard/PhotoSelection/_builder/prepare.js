import {
  optimizeImage,
} from "@/components/dashboard/CreateFlipbook/_builder/optimizeImage";

const CONCURRENCY = 3;

export async function prepareSelectionPhoto(file) {
  const optimized = await optimizeImage(file);
  const prepared = new File([optimized.blob], file.name, { type: optimized.blob.type || file.type, lastModified: file.lastModified });
  prepared.selectionRelativePath = file.selectionRelativePath || file.webkitRelativePath?.split("/").slice(1).join("/") || file.name;
  return prepared;
}

export async function prepareSelectionPhotos(files, onProgress) {
  const prepared = new Array(files.length);
  let cursor = 0;
  let finished = 0;
  onProgress?.({ current: 0, total: files.length, name: files[0]?.name || "" });

  async function run() {
    while (cursor < files.length) {
      const index = cursor;
      cursor += 1;
      const file = files[index];
      onProgress?.({ current: finished, total: files.length, name: file.name });
      prepared[index] = await prepareSelectionPhoto(file);
      finished += 1;
      onProgress?.({ current: finished, total: files.length, name: file.name });
    }
  }

  const workers = Math.min(CONCURRENCY, files.length);
  await Promise.all(Array.from({ length: workers }, () => run()));
  return prepared;
}
