const ACCEPT = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export function isAcceptedImage(file) {
  return ACCEPT.includes(file.type);
}

export async function optimizeImage(file, { maxEdge = 1600, quality = 0.82, onProgress } = {}) {
  onProgress?.(10);

  const bitmap = await createImageBitmap(file);
  onProgress?.(40);

  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { alpha: false });
  if (!context) {
    bitmap.close();
    throw new Error("Could not optimize this image.");
  }

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  onProgress?.(72);

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) resolve(result);
        else reject(new Error("Could not compress this image."));
      },
      "image/jpeg",
      quality
    );
  });

  onProgress?.(100);
  return { blob, width, height };
}
