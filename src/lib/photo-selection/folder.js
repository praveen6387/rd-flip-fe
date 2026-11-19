export function sourceRelativePath(file) {
  const raw = String(file?.webkitRelativePath || file?.relativePath || "").replace(/\\/g, "/");
  const parts = raw.split("/").filter((part) => part && part !== "." && part !== "..");
  if (parts.length > 1 && parts.at(-1) === file?.name) return parts.join("/");
  return file?.name || "";
}

export function uploadedFolder(files) {
  const paths = Array.from(files).map(file => file.webkitRelativePath || file.selectionRelativePath || "");
  if (!paths.length || paths.some(path => !path.includes("/"))) {
    throw new Error("Choose the photo folder to upload.");
  }
  const folder = paths[0].split("/")[0];
  if (paths.some(path => path.split("/")[0] !== folder || path.split("/").some(part => !part || part === "." || part === ".."))) {
    throw new Error("Choose one photo folder at a time.");
  }
  return { folder, paths: paths.map(path => path.split("/").slice(1).join("/")) };
}
