const ACCEPT = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export const TARGET_PHOTO_BYTES = 1 * 1024 * 1024; // 1 MB
const LONG_EDGE = 2200;
const FIRST_QUALITY = 0.86;
const SECOND_QUALITY = 0.8;

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
  context.imageSmoothingQuality = "medium";
  context.drawImage(bitmap, 0, 0, width, height);
  return canvas;
}

export async function optimizeImage(
  file,
  { targetBytes = TARGET_PHOTO_BYTES } = {}
) {
  const bitmap = await createImageBitmap(file);
  const sourceW = bitmap.width;
  const sourceH = bitmap.height;

  const isJpeg =
    file.type === "image/jpeg" ||
    file.type === "image/jpg" ||
    /\.jpe?g$/i.test(file.name || "");

  if (isJpeg && file.size <= targetBytes) {
    bitmap.close();
    return { blob: file, width: sourceW, height: sourceH };
  }

  const scale = Math.min(1, LONG_EDGE / Math.max(sourceW, sourceH));
  const width = Math.max(1, Math.round(sourceW * scale));
  const height = Math.max(1, Math.round(sourceH * scale));
  const canvas = paint(bitmap, width, height);
  bitmap.close();

  let blob = await toJpeg(canvas, FIRST_QUALITY);
  if (blob.size > targetBytes) {
    blob = await toJpeg(canvas, SECOND_QUALITY);
  }

  return { blob, width, height };
}
