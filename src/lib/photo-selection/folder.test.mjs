import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const source = await readFile(new URL("./folder.js", import.meta.url), "utf8");
const { uploadedFolder } = await import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);
test("folder upload automatically captures root and relative photo paths", () => {
  assert.deepEqual(uploadedFolder([{webkitRelativePath: "Wedding/A.JPG"}, {webkitRelativePath: "Wedding/Ceremony/B.PNG"}]), {folder: "Wedding", paths: ["A.JPG", "Ceremony/B.PNG"]});
});
test("plain files cannot silently lose source folder metadata", () => {
  assert.throws(() => uploadedFolder([{name: "A.JPG"}]), /Choose the photo folder/);
});
test("mixed roots and traversing paths are rejected", () => {
  assert.throws(() => uploadedFolder([{webkitRelativePath: "One/A.JPG"}, {webkitRelativePath: "Two/B.JPG"}]));
  assert.throws(() => uploadedFolder([{webkitRelativePath: "One/../A.JPG"}]));
});
