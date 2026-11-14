import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const source = await readFile(new URL("./rules.js", import.meta.url), "utf8");
const { clientSelectBlock } = await import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);

test("fixed mode stops the client at the displayed target", () => {
  const block = clientSelectBlock({ rules: { selectionMode: "FIXED", requiredPhotos: 2, photosPerSheet: 4 }, selectedCount: 2, extraAllowed: false });
  assert.equal(block.type, "limit");
  assert.match(block.message, /Fixed target of 2 photos/);
});

test("minimum mode asks before an extra photo and blocks when extras are off", () => {
  assert.equal(clientSelectBlock({ rules: { selectionMode: "MIN_EXTRA", includedPhotos: 2, allowExtraPhotos: true }, selectedCount: 2, extraAllowed: false }).type, "extra");
  assert.equal(clientSelectBlock({ rules: { selectionMode: "MIN_EXTRA", includedPhotos: 2, allowExtraPhotos: true }, selectedCount: 2, extraAllowed: true }), null);
  assert.equal(clientSelectBlock({ rules: { selectionMode: "MIN_EXTRA", includedPhotos: 2, allowExtraPhotos: false }, selectedCount: 2, extraAllowed: true }).type, "limit");
});

test("unlimited mode does not block another selection", () => {
  assert.equal(clientSelectBlock({ rules: { selectionMode: "UNLIMITED" }, selectedCount: 40, extraAllowed: false }), null);
});
