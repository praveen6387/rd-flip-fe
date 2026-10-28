import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const source = await readFile(new URL("./errors.js", import.meta.url), "utf8");
const { driveFailure } = await import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);
test("expired refresh token gives actionable reconnect error and storage status", () => {
  for (const error of [{message: "invalid_grant"}, {response: {data: {error: "invalid_grant"}}}]) {
    const result = driveFailure(error);
    assert.equal(result.status, 503);
    assert.equal(result.code, "drive_reconnect_required");
    assert.match(result.message, /GOOGLE_OAUTH_REFRESH_TOKEN/);
    assert.match(result.message, /No new folder/);
  }
});
test("other errors remain distinct from OAuth rejection", () => {
  assert.equal(driveFailure(new Error("Drive folder unavailable")).code, "drive_storage_unavailable");
});
