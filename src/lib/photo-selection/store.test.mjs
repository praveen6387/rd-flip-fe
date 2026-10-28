import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const source = (await readFile(new URL("./store.js", import.meta.url), "utf8")).replace('import { authenticatedFetch } from "@/lib/api/client/auth";', 'const authenticatedFetch = (...args) => globalThis.selectionTestFetch(...args);');
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
test("upload failure carries the saved draft id for retry without recreating", async () => {
  const calls = [];
  globalThis.selectionTestFetch = async path => { calls.push(path); if (path === "/selection-storage") return response(true, {ready: true}); if (path === "/api/photo-selection/") return response(true, {album: {id: "draft-id"}}); return response(false, null, "Drive unavailable"); };
  const file = new Blob(["photo"], {type: "image/jpeg"}); file.name = "A.JPG";
  await assert.rejects(createAlbum({files: [file]}), error => error.albumId === "draft-id" && /without using another credit/.test(error.message));
  assert.equal(calls.filter(path => path === "/api/photo-selection/").length, 1);
});
