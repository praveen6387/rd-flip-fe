import { authenticatedFetch, getAccessToken } from "@/lib/api/client/auth";

async function request(path, options = {}, publicRequest = false) {
  const response = await (publicRequest ? fetch : authenticatedFetch)(path, options);
  const result = await response.json().catch(() => null);
  if (!response.ok || result?.status === "fail") {
    const error = new Error(result?.message || "Could not load photo selection.");
    error.status = response.status;
    throw error;
  }
  return result.data;
}
const root = "/api/photo-selection/";
const json = (body) => ({ method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
export async function listAlbums() { return (await request(root)).albums; }
export async function getAlbum(id) { return (await request(`${root}${id}/`)).album; }
export async function listPhotos(id) { return (await getAlbum(id)).photos; }
export async function publishAlbum(id) { return (await request(`${root}${id}/`, json({ action: "publish" }))).album; }
const UPLOAD_CONCURRENCY = 6;

async function runPool(items, worker) {
  const results = new Array(items.length);
  let cursor = 0;
  let failed = false;

  async function run() {
    while (!failed && cursor < items.length) {
      const index = cursor;
      cursor += 1;
      try {
        results[index] = await worker(items[index], index);
      } catch (error) {
        failed = true;
        throw error;
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(UPLOAD_CONCURRENCY, items.length) }, () => run()));
  return results;
}

async function uploadSelectionFile(id, file) {
  const body = new FormData();
  body.append("photo", file, file.name);
  body.append("originalRelativePath", file.selectionRelativePath || file.name);
  return request(`/selection-upload/${id}`, { method: "POST", body });
}

export async function createAlbum({ files, onProgress, ...values }) {
  if (!files?.length) throw new Error("Upload at least one photo.");
  await request("/selection-storage", { cache: "no-store" });
  const albumId = crypto.randomUUID();
  const uploaded = [];
  let done = 0;
  onProgress?.({ phase: "upload", current: 0, total: files.length });
  try {
    await runPool(files, async (file) => {
      const saved = await uploadSelectionFile(albumId, file);
      uploaded.push(saved);
      done += 1;
      onProgress?.({ phase: "upload", current: done, total: files.length });
    });
    onProgress?.({ phase: "save", current: files.length, total: files.length });
    return (await request(root, json({ ...values, id: albumId, photos: uploaded }))).album;
  } catch (error) {
    const keys = uploaded.map((item) => item.objectKey).filter(Boolean);
    if (keys.length) {
      await request(`/selection-upload/${albumId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keys }),
      }).catch(() => {});
    }
    throw error;
  }
}
export async function addPhotos(id, files, onProgress, publish = false) {
  const uploaded = [];
  let done = 0;
  onProgress?.({ phase: "upload", current: 0, total: files.length });
  try {
    await runPool(files, async (file) => {
      const saved = await uploadSelectionFile(id, file);
      uploaded.push(saved);
      done += 1;
      onProgress?.({ phase: "upload", current: done, total: files.length });
    });
    onProgress?.({ phase: "save", current: files.length, total: files.length });
    await request(`${root}${id}/`, json({ photos: uploaded, publish }));
  } catch (error) {
    const keys = uploaded.map((item) => item.objectKey).filter(Boolean);
    if (keys.length) {
      await request(`/selection-upload/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keys }),
      }).catch(() => {});
    }
    throw error;
  }
}
export async function removePhoto(albumId, id) { await request(`${root}${albumId}/photos/${id}/`, { method: "DELETE" }); }
export async function deleteAlbum(id) { await request(`${root}${id}/`, { method: "DELETE" }); }
function withSelectionAccess(options, access = {}) {
  const headers = { ...(options.headers || {}) };
  if (access.code) headers["X-Selection-Code"] = access.code;
  if (access.studio) {
    const token = getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  return { ...options, headers };
}
export async function getPublicAlbum(token, access = {}) {
  return (await request(`${root}public/${token}/`, withSelectionAccess({ cache: "no-store" }, access), true)).album;
}
export async function submitSelection(token, selectedIds, access = {}) {
  return (await request(`${root}public/${token}/`, withSelectionAccess(json({ selectedIds }), access), true)).album;
}
