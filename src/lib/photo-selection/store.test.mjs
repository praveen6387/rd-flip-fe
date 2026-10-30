import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
globalThis.crypto = { randomUUID };
const source = (await readFile(new URL("./store.js", import.meta.url), "utf8")).replace('import { authenticatedFetch, getAccessToken } from "@/lib/api/client/auth";', 'const authenticatedFetch = (...args) => globalThis.selectionTestFetch(...args); const getAccessToken = () => null;');
const { createAlbum } = await import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);
function response(ok, data, message) { return { ok, async json() { return { status: ok ? "success" : "fail", data, message }; } }; }
test("unconfigured storage blocks creation before a folder or credit is used", async () => {
  const calls = [];
  globalThis.selectionTestFetch = async path => { calls.push(path); return response(false, null, "Storage not configured"); };
  await assert.rejects(createAlbum({ files: [{}] }), /Storage not configured/);
  assert.deepEqual(calls, ["/selection-storage"]);
});
test("empty selection is rejected without any API calls", async () => {
  globalThis.selectionTestFetch = () => { throw new Error("unexpected API request"); };
  await assert.rejects(createAlbum({ files: [] }), /at least one photo/);
});
test("upload failure does not create a folder or use a credit", async () => {
  const calls = [];
  globalThis.selectionTestFetch = async (path, options = {}) => {
    calls.push([options.method || "GET", path]);
    if (path === "/selection-storage") return response(true, {ready: true});
    return response(false, null, "Upload failed");
  };
  const file = new Blob(["photo"], {type: "image/jpeg"}); file.name = "A.JPG";
  await assert.rejects(createAlbum({files: [file]}), /Upload failed/);
  assert.equal(calls.some((call) => call[1] === "/api/photo-selection/"), false);
});
