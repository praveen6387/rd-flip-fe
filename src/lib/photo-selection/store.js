import { authenticatedFetch } from "@/lib/api/client/auth";

async function request(path, options = {}, publicRequest = false) {
  const response = await (publicRequest ? fetch : authenticatedFetch)(path, options);
  const result = await response.json().catch(() => null);
  if (!response.ok || result?.status === "fail") throw new Error(result?.message || "Could not load photo selection.");
  return result.data;
}
const root = "/api/photo-selection/";
const json = (body) => ({ method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
export async function listAlbums() { return (await request(root)).albums; }
export async function getAlbum(id) { return (await request(`${root}${id}/`)).album; }
export async function listPhotos(id) { return (await getAlbum(id)).photos; }
export async function publishAlbum(id) { return (await request(`${root}${id}/`, json({ action: "publish" }))).album; }
export async function createAlbum({ files, ...values }) {
  const album = (await request(root, json(values))).album;
  try {
    await addPhotos(album.id, files);
    return await publishAlbum(album.id);
  } catch (error) {
    throw new Error(`${error.message} Your draft folder was saved; open it to retry the upload.`);
  }
}
export async function addPhotos(id, files) {
  for (const file of files) {
    const body = new FormData();
    body.append("photo", file);
    body.append("originalRelativePath", file.selectionRelativePath || file.name);
    await request(`/selection-upload/${id}`, { method: "POST", body });
  }
}
export async function removePhoto(albumId, id) { await request(`${root}${albumId}/photos/${id}/`, { method: "DELETE" }); }
export async function deleteAlbum(id) { await request(`${root}${id}/`, { method: "DELETE" }); }
export async function getPublicAlbum(token) { return (await request(`${root}public/${token}/`, {}, true)).album; }
export async function submitSelection(token, selectedIds) { return (await request(`${root}public/${token}/`, json({ selectedIds }), true)).album; }
