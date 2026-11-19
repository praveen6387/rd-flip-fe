// A stored path is a reference. Browsers require the studio to grant folder access again.
export function folderBasename(path) { return path.replace(/[\\/]+$/, "").split(/[\\/]/).pop(); }
export function missingOriginals(album, available) {
  const names = album.photos.filter(p => p.selected).map(p => p.originalRelativePath || p.name);
  return names.filter(name => !available.has(name));
}
export function exportRelativePath(photo) {
  const disk = String(photo.originalRelativePath || photo.name || "").replace(/\\/g, "/");
  const parts = disk.split("/").filter(Boolean);
  return parts.join("/") || photo.name;
}
export function missingMessage(folder, names) {
  const shown = names.slice(0, 5).join(", ");
  const where = folder ? `“${folder}”` : "the selected folder";
  return `These selected photos are not in ${where}: ${shown}. Choose the folder that still contains them.`;
}

async function openFile(directory, relative) {
  const parts = String(relative || "").split("/").filter(Boolean);
  if (!parts.length) throw Object.assign(new Error("Missing"), { name: "NotFoundError" });
  let current = directory;
  for (const part of parts.slice(0, -1)) current = await current.getDirectoryHandle(part);
  return current.getFileHandle(parts.at(-1));
}

async function freshDirectory(parent, baseName) {
  for (let index = 1; index <= 1000; index += 1) {
    const name = index === 1 ? baseName : `${baseName} (${index})`;
    try {
      await parent.getDirectoryHandle(name);
    } catch (error) {
      if (error.name === "TypeMismatchError") continue;
      if (error.name !== "NotFoundError") throw error;
      return parent.getDirectoryHandle(name, { create: true });
    }
  }
  throw new Error("Could not create a new selected folder. Rename an earlier Selected folder and try again.");
}

async function writeOriginal(output, relative, handle) {
  const parts = relative.split("/").filter(Boolean);
  let directory = output;
  for (const part of parts.slice(0, -1)) directory = await directory.getDirectoryHandle(part, { create: true });
  const target = await directory.getFileHandle(parts.at(-1), { create: true });
  const writable = await target.createWritable();
  await writable.write(await handle.getFile());
  await writable.close();
}

async function sourceDirectory(directoryPromise) {
  try {
    return await directoryPromise;
  } catch (error) {
    if (error.name === "AbortError") throw new Error("Folder selection was cancelled.");
    throw error;
  }
}

async function openStored(source, relative) {
  try {
    return await openFile(source, relative);
  } catch (error) {
    if (error.name !== "NotFoundError" && error.name !== "TypeMismatchError") throw error;
  }
  const parts = String(relative || "").split("/").filter(Boolean);
  if (source.name && parts[0] === source.name && parts.length > 1) {
    try {
      return await openFile(source, parts.slice(1).join("/"));
    } catch (error) {
      if (error.name !== "NotFoundError" && error.name !== "TypeMismatchError") throw error;
    }
  }
  return null;
}

async function filesByName(directory) {
  const found = new Map();
  async function walk(dir, path) {
    const listed = typeof dir.entries === "function" ? dir.entries() : dir.entries;
    if (!listed) return;
    for await (const [name, handle] of listed) {
      if (name === "Selected" || /^Selected \(\d+\)$/.test(name)) continue;
      const relative = path ? `${path}/${name}` : name;
      if (typeof handle.getFile === "function") {
        const rows = found.get(name) || [];
        rows.push({ handle, relative });
        found.set(name, rows);
      } else if (typeof handle.getDirectoryHandle === "function") {
        await walk(handle, relative);
      }
    }
  }
  await walk(directory, "");
  return found;
}

async function selectedOriginals(album, source) {
  const selected = album.photos.filter((photo) => photo.selected);
  if (!selected.length) throw new Error("No photos have been selected.");
  const originals = new Map();
  const missed = [];
  for (const photo of selected) {
    const relative = photo.originalRelativePath || photo.name;
    const handle = await openStored(source, relative);
    if (handle) originals.set(relative, { handle, outputPath: exportRelativePath(photo) });
    else missed.push(photo);
  }
  if (missed.length) {
    const indexed = await filesByName(source);
    const ambiguous = [];
    for (const photo of missed) {
      const relative = photo.originalRelativePath || photo.name;
      const hits = indexed.get(photo.name) || [];
      if (hits.length === 1) originals.set(relative, { handle: hits[0].handle, outputPath: exportRelativePath(photo) });
      else if (hits.length > 1) ambiguous.push(`${photo.name} (${hits.map((hit) => hit.relative).join(" or ")})`);
    }
    if (ambiguous.length) throw new Error(`These file names are in more than one folder: ${ambiguous.slice(0, 5).join(", ")}.`);
  }
  const missing = missingOriginals(album, originals);
  if (missing.length) throw new Error(missingMessage(source.name, missing));
  return originals;
}

export async function copySelectedOriginals(album, directoryPromise, onProgress) {
  if (!directoryPromise && !window.showDirectoryPicker) throw new Error("Use Download originals to choose the original folder in this browser.");
  if (album.status !== "selected") throw new Error("The client must submit their selection before extracting originals.");
  const source = await sourceDirectory(directoryPromise || window.showDirectoryPicker({ mode: "readwrite", id: "rd-flip-selection-originals" }));
  const originals = await selectedOriginals(album, source);
  const selected = album.photos.filter((photo) => photo.selected);
  const output = await freshDirectory(source, "Selected");
  let copied = 0;
  onProgress?.({ current: 0, total: selected.length });
  for (const photo of selected) {
    const found = originals.get(photo.originalRelativePath || photo.name);
    await writeOriginal(output, found.outputPath, found.handle);
    copied += 1;
    onProgress?.({ current: copied, total: selected.length });
  }
  return copied;
}

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function header(size) { const bytes = new Uint8Array(size); return { bytes, view: new DataView(bytes.buffer) }; }
export async function originalsZip(files, onProgress) {
  const chunks = [], central = [];
  let offset = 0, centralSize = 0;
  for (const [index, file] of files.entries()) {
    const name = new TextEncoder().encode(`Selected/${file.zipPath || `Images/${file.name}`}`);
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (bytes.length > 0xffffffff || offset + bytes.length > 0xffffffff) throw new Error("Export is too large for a ZIP. Use Extract selected originals instead.");
    const crc = crc32(bytes);
    const local = header(30);
    local.view.setUint32(0, 0x04034b50, true);
    local.view.setUint16(4, 20, true);
    local.view.setUint16(6, 0x800, true);
    local.view.setUint32(14, crc, true);
    local.view.setUint32(18, bytes.length, true);
    local.view.setUint32(22, bytes.length, true);
    local.view.setUint16(26, name.length, true);
    chunks.push(local.bytes, name, bytes);
    const entry = header(46);
    entry.view.setUint32(0, 0x02014b50, true);
    entry.view.setUint16(4, 20, true); entry.view.setUint16(6, 20, true);
    entry.view.setUint16(8, 0x800, true);
    entry.view.setUint32(16, crc, true);
    entry.view.setUint32(20, bytes.length, true); entry.view.setUint32(24, bytes.length, true);
    entry.view.setUint16(28, name.length, true); entry.view.setUint32(42, offset, true);
    central.push(entry.bytes, name);
    centralSize += 46 + name.length;
    offset += 30 + name.length + bytes.length;
    onProgress?.({ current: index + 1, total: files.length });
  }
  if (files.length > 65535 || offset + centralSize > 0xffffffff) throw new Error("Export is too large. Use Extract selected originals instead.");
  const end = header(22);
  end.view.setUint32(0, 0x06054b50, true);
  end.view.setUint16(8, files.length, true); end.view.setUint16(10, files.length, true);
  end.view.setUint32(12, centralSize, true); end.view.setUint32(16, offset, true);
  return new Blob([...chunks, ...central, end.bytes], { type: "application/zip" });
}
export async function downloadOriginals(album, directoryPromise, onProgress) {
  if (!directoryPromise && !window.showDirectoryPicker) throw new Error("This browser cannot choose a folder for the ZIP.");
  if (album.status !== "selected") throw new Error("The client must submit their selection before downloading originals.");
  const source = await sourceDirectory(directoryPromise || window.showDirectoryPicker({ mode: "read", id: "rd-flip-selection-originals" }));
  const originals = await selectedOriginals(album, source);
  const selected = album.photos.filter((photo) => photo.selected);
  const files = [];
  for (const photo of selected) {
    const found = originals.get(photo.originalRelativePath || photo.name);
    const file = await found.handle.getFile();
    file.zipPath = found.outputPath;
    files.push(file);
  }
  onProgress?.({ current: 0, total: files.length });
  const url = URL.createObjectURL(await originalsZip(files, onProgress));
  const link = document.createElement("a");
  link.href = url; link.download = `${album.folderName.replace(/[^a-z0-9_-]/gi, "_")}-selected.zip`; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
