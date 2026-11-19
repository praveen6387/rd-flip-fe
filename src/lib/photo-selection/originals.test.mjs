import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const source = await readFile(new URL("./originals.js", import.meta.url), "utf8");
const { folderBasename, missingOriginals, exportRelativePath, originalsZip, copySelectedOriginals } = await import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);
test("saved Windows and macOS paths resolve folder name", () => {
  assert.equal(folderBasename("D:\\Wedding\\Originals\\"), "Originals");
  assert.equal(folderBasename("/Users/studio/Originals/"), "Originals");
});
test("missing original check considers only selected filenames and exact extension", () => {
  const album = { photos: [{name: "A.PNG", selected: true}, {name: "B.jpg", selected: false}] };
  assert.deepEqual(missingOriginals(album, new Map([["A.jpg", {}]])), ["A.PNG"]);
  assert.deepEqual(missingOriginals(album, new Map([["A.PNG", {}]])), []);
});
test("ZIP contains original bytes and Selected/Images path", async () => {
  const file = new Blob(["original photo bytes"]); file.name = "A.PNG";
  const blob = await originalsZip([file]);
  const bytes = Buffer.from(await blob.arrayBuffer());
  assert.equal(bytes.readUInt32LE(0), 0x04034b50);
  assert.ok(bytes.includes(Buffer.from("Selected/Images/A.PNG")));
  assert.ok(bytes.includes(Buffer.from("original photo bytes")));
  assert.equal(bytes.readUInt32LE(bytes.length - 22), 0x06054b50);
  const { writeFile } = await import("node:fs/promises");
  await writeFile("/tmp/rd-selection-test.zip", bytes);
});

test("original matching preserves nested folder paths", () => {
  const album = { photos: [{name: "A.JPG", originalRelativePath: "Ceremony/A.JPG", selected: true}] };
  assert.deepEqual(missingOriginals(album, new Map([["A.JPG", {}]])), ["Ceremony/A.JPG"]);
  assert.deepEqual(missingOriginals(album, new Map([["Ceremony/A.JPG", {}]])), []);
});

function directory(name, entries = new Map()) {
  return {
    name, entries,
    async getDirectoryHandle(key, options = {}) {
      if (entries.has(key)) return entries.get(key);
      if (!options.create) throw Object.assign(new Error("Missing"), { name: "NotFoundError" });
      const value = directory(key); entries.set(key, value); return value;
    },
    async getFileHandle(key, options = {}) {
      if (entries.has(key)) return entries.get(key);
      if (!options.create) throw Object.assign(new Error("Missing"), { name: "NotFoundError" });
      const value = { bytes: null, async createWritable() { return { async write(bytes) { value.bytes = bytes; }, async close() {} }; } };
      entries.set(key, value); return value;
    },
  };
}
test("extract copies selected originals into a Selected folder inside the picked folder", async () => {
  const original = new Blob(["full resolution original"]);
  const source = directory("Wedding", new Map([["A.JPG", { async getFile() { return original; } }], ["B.JPG", {}], ["Selected", directory("Selected")]]));
  globalThis.window = { async showDirectoryPicker() { return source; } };
  const album = { status: "selected", originalFolderPath: "Wedding", photos: [{name: "A.JPG", selected: true}, {name: "B.JPG", selected: false}] };
  assert.equal(await copySelectedOriginals(album), 1);
  const created = source.entries.get("Selected (2)");
  assert.deepEqual([...created.entries.keys()], ["A.JPG"]);
  assert.equal(created.entries.get("A.JPG").bytes, original);
  delete globalThis.window;
});
test("extract copies the uploaded folder names and leaves the chip off", async () => {
  const first = new Blob(["camera first"]);
  const second = new Blob(["camera second"]);
  const loose = new Blob(["loose"]);
  const root = directory("RD Shaadi", new Map([
    ["0-A.jpg", { async getFile() { return loose; } }],
    ["camera first", directory("camera first", new Map([["IMG.jpg", { async getFile() { return first; } }]]))],
    ["camera second", directory("camera second", new Map([["IMG.jpg", { async getFile() { return second; } }]]))],
  ]));
  globalThis.window = { async showDirectoryPicker() { return root; } };
  const album = { status: "selected", folderName: "RD Test", photos: [
    { name: "IMG.jpg", originalRelativePath: "camera first/IMG.jpg", category: "Haldi", selected: true },
    { name: "IMG.jpg", originalRelativePath: "camera second/IMG.jpg", category: "Haldi", selected: true },
    { name: "0-A.jpg", originalRelativePath: "0-A.jpg", category: "Haldi", selected: true },
  ] };
  assert.equal(exportRelativePath(album.photos[0]), "camera first/IMG.jpg");
  assert.equal(await copySelectedOriginals(album), 3);
  const selected = root.entries.get("Selected");
  assert.equal(selected.entries.has("Haldi"), false);
  assert.equal(selected.entries.get("camera first").entries.get("IMG.jpg").bytes, first);
  assert.equal(selected.entries.get("camera second").entries.get("IMG.jpg").bytes, second);
  assert.equal(selected.entries.get("0-A.jpg").bytes, loose);
  delete globalThis.window;
});
test("the same file name in two folders is not guessed", async () => {
  const root = directory("RD Shaadi", new Map([
    ["H (26).jpg", { async getFile() { return new Blob(["root"]); } }],
    ["barat", directory("barat", new Map([["H (26).jpg", { async getFile() { return new Blob(["barat"]); } }]]))],
  ]));
  globalThis.window = { async showDirectoryPicker() { return root; } };
  await assert.rejects(copySelectedOriginals({ status: "selected", photos: [{ name: "H (26).jpg", originalRelativePath: "Mehndi/H (26).jpg", selected: true }] }), /more than one folder/);
  assert.equal(root.entries.has("Selected"), false);
  delete globalThis.window;
});
test("missing originals prevent creating an output folder", async () => {
  const parent = directory("Photos", new Map([["Wedding", directory("Wedding")]]));
  globalThis.window = { async showDirectoryPicker() { return parent; } };
  await assert.rejects(copySelectedOriginals({status: "selected", originalFolderPath: "Wedding", photos: [{name: "missing.JPG", selected: true}]}), /not in/);
  assert.deepEqual([...parent.entries.keys()], ["Wedding"]);
  delete globalThis.window;
});
