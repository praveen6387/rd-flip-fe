import { s3DisplaySrc } from "@/lib/s3/media";
import { buildFlipSheets } from "./buildSheets";
import {
  BLANK_TEXTURE,
  buildBookPages,
  collectTextureUrls,
} from "./_builder/book/buildBookPages";

const WHITE_SVG =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="1000"><rect width="100%" height="100%" fill="#ffffff"/></svg>'
  );

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Could not load ${src}`));
    img.src = src;
  });
}

function canvasToBlobUrl(canvas, type = "image/jpeg", quality = 0.92) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Could not encode page"));
          return;
        }
        resolve(URL.createObjectURL(blob));
      },
      type,
      quality
    );
  });
}

async function splitSpread(src, crop, cache) {
  const key = `${src}::${crop}`;
  if (cache.has(key)) return cache.get(key);

  const img = await loadImage(src);
  const halfW = Math.max(1, Math.floor(img.naturalWidth / 2));
  const height = img.naturalHeight || 1;
  const canvas = document.createElement("canvas");
  canvas.width = halfW;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) throw new Error("Canvas unavailable");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, halfW, height);
  ctx.drawImage(
    img,
    crop === "left" ? 0 : halfW,
    0,
    halfW,
    height,
    0,
    0,
    halfW,
    height
  );

  const url = await canvasToBlobUrl(canvas);
  cache.set(key, url);
  return url;
}

async function sheetToImageUrl(sheet, cache) {
  if (cache.has(sheet.id)) return cache.get(sheet.id);

  if (sheet.kind === "blank") {
    cache.set(sheet.id, WHITE_SVG);
    return WHITE_SVG;
  }

  const src = s3DisplaySrc(sheet.src);
  const url =
    sheet.kind === "split" ? await splitSpread(src, sheet.crop, cache) : src;

  cache.set(sheet.id, url);
  return url;
}

/**
 * Classic-only prep: one network fetch per photo, parallel, no Studio work.
 */
export async function prepareClassicMedia(pages, { onProgress } = {}) {
  const sheets = buildFlipSheets(pages);
  const cache = new Map();
  const total = Math.max(sheets.length, 1);
  let done = 0;

  const report = () => onProgress?.(Math.min(1, done / total));

  report();

  const classicUrls = await Promise.all(
    sheets.map(async (sheet) => {
      try {
        return await sheetToImageUrl(sheet, cache);
      } catch {
        return WHITE_SVG;
      } finally {
        done += 1;
        report();
      }
    })
  );

  // Decode once so PageFlip hits cache and paints immediately.
  await Promise.all(
    classicUrls.map((url) => loadImage(url).catch(() => null))
  );

  onProgress?.(1);

  return { sheets, classicUrls };
}

/**
 * Studio textures — only when user switches to Studio.
 * Wait on the first batch so the 3D view can mount quickly; rest warm in background.
 */
export async function prepareStudioMedia(pages, { onProgress } = {}) {
  const bookPages = buildBookPages(pages);
  const textureUrls = collectTextureUrls(bookPages);
  const remoteUrls = textureUrls.filter(
    (url) => url && url !== BLANK_TEXTURE
  );
  const priority = remoteUrls.slice(0, 8);
  const rest = remoteUrls.slice(8);
  const total = Math.max(priority.length, 1);
  let done = 0;

  await Promise.all(
    priority.map((url) =>
      loadImage(url)
        .catch(() => null)
        .finally(() => {
          done += 1;
          onProgress?.(Math.min(1, done / total));
        })
    )
  );

  onProgress?.(1);

  // Warm remaining images without blocking first paint.
  rest.forEach((url) => {
    loadImage(url).catch(() => null);
  });

  return { bookPages, textureUrls };
}

/** @deprecated Prefer prepareClassicMedia / prepareStudioMedia */
export async function prepareViewerMedia(pages, { onProgress } = {}) {
  const classic = await prepareClassicMedia(pages, {
    onProgress: (r) => onProgress?.(r * 0.7),
  });
  const studio = await prepareStudioMedia(pages, {
    onProgress: (r) => onProgress?.(0.7 + r * 0.3),
  });
  return { ...classic, ...studio };
}
