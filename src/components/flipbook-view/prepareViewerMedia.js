import { s3DisplaySrc } from "@/lib/s3/media";
import { buildFlipSheets } from "./buildSheets";

/** Page list for the book. Middle spreads stay one image and are cropped in CSS. */
export function prepareClassicMedia(pages) {
  return buildFlipSheets(pages).map((sheet) => ({
    src: s3DisplaySrc(sheet.src),
    crop: sheet.kind === "split" ? sheet.crop : "",
  }));
}
