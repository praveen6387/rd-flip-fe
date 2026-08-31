import { s3DisplaySrc } from "@/lib/s3/media";
import { buildFlipSheets } from "../../buildSheets";

export const BLANK_TEXTURE =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="4" height="3"><rect width="100%" height="100%" fill="#ffffff"/></svg>'
  );

function sheetToFace(sheet) {
  if (!sheet || sheet.kind === "blank") {
    return { kind: "blank" };
  }

  return {
    kind: sheet.kind === "split" ? "split" : "image",
    src: sheet.src,
    crop: sheet.crop,
  };
}

export function faceToTextureUrl(face) {
  if (!face || face.kind === "blank") return BLANK_TEXTURE;
  return s3DisplaySrc(face.src);
}

/**
 * R3F book leaf faces (reading order):
 * pageAtom 0 (closed front) → right = leaf[0].front
 * pageAtom 1               → left = leaf[0].back, right = leaf[1].front
 * pageAtom n               → left = leaf[n-1].back, right = leaf[n].front
 * pageAtom length (closed) → left = leaf[last].back
 *
 * So sheet[0], sheet[1], sheet[2]… map straight onto front/back/front/back…
 * matching buildFlipSheets:
 *   front cover photo → sheet[0] (right when closed)
 *   extra fronts      → blank | photo
 *   middles           → left-half | right-half
 *   extra backs       → photo | blank
 *   last back         → photo alone (left when closed)
 */
export function buildBookPages(pages) {
  const sheets = buildFlipSheets(pages);
  if (!sheets.length) return [];

  const bookPages = [];

  for (let index = 0; index < sheets.length; index += 2) {
    bookPages.push({
      id: `leaf-${index / 2}`,
      front: sheetToFace(sheets[index]),
      back: sheetToFace(sheets[index + 1]),
    });
  }

  return bookPages;
}

export function collectTextureUrls(bookPages) {
  const urls = new Set([BLANK_TEXTURE]);

  for (const page of bookPages) {
    for (const face of [page.front, page.back]) {
      if (face?.kind !== "blank" && face?.src) {
        urls.add(s3DisplaySrc(face.src));
      }
    }
  }

  return [...urls];
}
