import { s3DisplaySrc } from "@/lib/s3/media";
import { buildFlipSheets } from "./buildSheets";
import {
  BLANK_TEXTURE,
  buildBookPages,
  collectTextureUrls,
} from "./_builder/book/buildBookPages";

const WHITE_W = 1600;
const WHITE_H = Math.round(WHITE_W / (7 / 5));

let whiteImageUrl = "";

function getWhiteImageUrl() {
  if (whiteImageUrl) return whiteImageUrl;

  const canvas = document.createElement("canvas");
  canvas.width = WHITE_W;
  canvas.height = WHITE_H;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    whiteImageUrl =
      "data:image/svg+xml," +
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${WHITE_W}" height="${WHITE_H}"><rect width="100%" height="100%" fill="#ffffff"/></svg>`
      );
    return whiteImageUrl;
  }

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, WHITE_W, WHITE_H);
  whiteImageUrl = canvas.toDataURL("image/png");
  return whiteImageUrl;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Could not load ${src}`));
    img.src = src;
  });
}

async function splitSpread(src, crop) {
  const img = await loadImage(src);
  const halfW = Math.max(1, Math.floor(img.naturalWidth / 2));
  const height = img.naturalHeight || 1;
  const canvas = document.createElement("canvas");
  canvas.width = halfW;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
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

  return canvas.toDataURL("image/png");
}

async function sheetToImageUrl(sheet, cache) {
  if (cache.has(sheet.id)) return cache.get(sheet.id);

  if (sheet.kind === "blank") {
    const url = getWhiteImageUrl();
    cache.set(sheet.id, url);
    return url;
  }

  const src = s3DisplaySrc(sheet.src);
  const url =
    sheet.kind === "split" ? await splitSpread(src, sheet.crop) : src;

  cache.set(sheet.id, url);
  return url;
}

/**
 * Load album images once for both Studio (textures) and Classic (sheets).
 * @param {object[]} pages
 * @param {{ onProgress?: (ratio: number) => void }} [options]
 */
export async function prepareViewerMedia(pages, { onProgress } = {}) {
  const sheets = buildFlipSheets(pages);
  const bookPages = buildBookPages(pages);
  const textureUrls = collectTextureUrls(bookPages);
  const remoteUrls = textureUrls.filter(
    (url) => url && url !== BLANK_TEXTURE
  );

  const report = (done, total) => {
    if (!onProgress || total <= 0) return;
    onProgress(Math.min(1, done / total));
  };

  let done = 0;
  const total = Math.max(remoteUrls.length + sheets.length, 1);
  report(0, total);

  await Promise.all(
    remoteUrls.map((url) =>
      loadImage(url)
        .catch(() => null)
        .finally(() => {
          done += 1;
          report(done, total);
        })
    )
  );

  const cache = new Map();
  const classicUrls = [];

  for (const sheet of sheets) {
    classicUrls.push(await sheetToImageUrl(sheet, cache));
    done += 1;
    report(done, total);
  }

  onProgress?.(1);

  return {
    sheets,
    bookPages,
    textureUrls,
    classicUrls,
  };
}
