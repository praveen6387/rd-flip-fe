const ACCEPT = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export const TARGET_PHOTO_BYTES = 250 * 1024;
const MIN_QUALITY = 0.78;
const MIN_EDGE = 960;
const START_EDGE = 2048;

export function isAcceptedImage(file) {
  return ACCEPT.includes(file.type);
}

function toJpeg(canvas, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) resolve(result);
        else reject(new Error("Could not compress this image."));
      },
      "image/jpeg",
      quality
    );
  });
}

function paint(bitmap, width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { alpha: false });
  if (!context) {
    throw new Error("Could not optimize this image.");
  }
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(bitmap, 0, 0, width, height);
  return canvas;
}

export async function optimizeImage(
  file,
  { targetBytes = TARGET_PHOTO_BYTES, onProgress } = {}
) {
  onProgress?.(8);

  const bitmap = await createImageBitmap(file);
  const startScale = Math.min(
    1,
    START_EDGE / Math.max(bitmap.width, bitmap.height)
  );
  let width = Math.max(1, Math.round(bitmap.width * startScale));
  let height = Math.max(1, Math.round(bitmap.height * startScale));
  let quality = 0.86;
  onProgress?.(28);

  let canvas = paint(bitmap, width, height);
  let blob = await toJpeg(canvas, quality);
  onProgress?.(48);

  let steps = 0;
  while (blob.size > targetBytes && steps < 16) {
    steps += 1;
    const longEdge = Math.max(width, height);
    if (longEdge > MIN_EDGE) {
      const nextScale = Math.max(MIN_EDGE / longEdge, 0.88);
      width = Math.max(1, Math.round(width * nextScale));
      height = Math.max(1, Math.round(height * nextScale));
      canvas = paint(bitmap, width, height);
    } else if (quality > MIN_QUALITY + 0.02) {
      quality = Math.max(MIN_QUALITY, quality - 0.04);
    } else {
      break;
    }
    blob = await toJpeg(canvas, quality);
    onProgress?.(48 + Math.min(44, steps * 3));
  }

  bitmap.close();
  onProgress?.(100);
  return { blob, width, height };
}
