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

export async function prepareSelectionPhotos(files) {
  const prepared = new Array(files.length);
  let cursor = 0;

  async function run() {
    while (cursor < files.length) {
      const index = cursor;
      cursor += 1;
      prepared[index] = await prepareSelectionPhoto(files[index]);
    }
  }

  const workers = Math.min(CONCURRENCY, files.length);
  await Promise.all(Array.from({ length: workers }, () => run()));
  return prepared;
}
