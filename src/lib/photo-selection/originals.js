// A stored path is a reference. Browsers require the studio to grant folder access again.
export function folderBasename(path) { return path.replace(/[\\/]+$/, "").split(/[\\/]/).pop(); }
export function missingOriginals(album, available) {
  const names = album.photos.filter(p => p.selected).map(p => p.originalRelativePath || p.name);
  return names.filter(name => !available.has(name));
}
export function missingMessage(album, names) {
  return `Original photos not found (${names.slice(0, 5).join(", ")}). Move the original folder back to "${album.originalFolderPath}" and choose that folder again.`;
}

export async function copySelectedOriginals(album) {
  if (!window.showDirectoryPicker) throw new Error("Use Download originals to choose the original folder in this browser.");
  if (album.status !== "selected") throw new Error("The client must submit their selection before extracting originals.");
  const parent = await window.showDirectoryPicker({ mode: "readwrite" });
  const sourceName = folderBasename(album.originalFolderPath);
  let source;
  try { source = await parent.getDirectoryHandle(sourceName); }
  catch (error) {
    if (error.name !== "NotFoundError" && error.name !== "TypeMismatchError") throw error;
    throw new Error(`Original folder "${sourceName}" not found. Choose its parent folder, or move the original folder back to "${album.originalFolderPath}".`);
  }
  const originals = new Map();
  for (const photo of album.photos.filter(p => p.selected)) {
    const relative = photo.originalRelativePath || photo.name;
    const parts = relative.split("/");
    try {
      let directory = source;
      for (const part of parts.slice(0, -1)) directory = await directory.getDirectoryHandle(part);
      originals.set(relative, await directory.getFileHandle(parts.at(-1)));
    } catch (error) {
      if (error.name !== "NotFoundError" && error.name !== "TypeMismatchError") throw error;
    }
  }
  const missing = missingOriginals(album, originals);
  if (missing.length) throw new Error(missingMessage(album, missing));
  const selected = album.photos.filter(p => p.selected);
  if (!selected.length) throw new Error("No photos have been selected.");
  // Always use a new sibling so earlier exports are preserved and never mixed in.
  let output;
  for (let index = 1; index <= 1000; index++) {
    const name = `${sourceName} Selected${index === 1 ? "" : ` (${index})`}`;
    try { await parent.getDirectoryHandle(name); }
    catch (error) {
      if (error.name === "TypeMismatchError") continue;
      if (error.name !== "NotFoundError") throw error;
      output = await parent.getDirectoryHandle(name, { create: true });
      break;
    }
  }
  if (!output) throw new Error("Could not create a new selected folder. Rename an earlier export and try again.");
  for (const photo of selected) {
    const file = await originals.get(photo.originalRelativePath || photo.name).getFile();
    const target = await output.getFileHandle(photo.name, { create: true });
    const writable = await target.createWritable();
    await writable.write(file);
    await writable.close();
  }
  return selected.length;
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
export async function originalsZip(files) {
  const chunks = [], central = [];
  let offset = 0, centralSize = 0;
  for (const file of files) {
    const name = new TextEncoder().encode(`Selected/Images/${file.name}`);
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
  }
  if (files.length > 65535 || offset + centralSize > 0xffffffff) throw new Error("Export is too large. Use Extract selected originals instead.");
  const end = header(22);
  end.view.setUint32(0, 0x06054b50, true);
  end.view.setUint16(8, files.length, true); end.view.setUint16(10, files.length, true);
  end.view.setUint32(12, centralSize, true); end.view.setUint32(16, offset, true);
  return new Blob([...chunks, ...central, end.bytes], { type: "application/zip" });
}
export async function downloadOriginals(album, fileList) {
  const files = Array.from(fileList);
  const folder = files[0]?.webkitRelativePath?.split("/")[0];
  if (folder !== folderBasename(album.originalFolderPath)) throw new Error(`Choose the folder saved at "${album.originalFolderPath}". Move the folder back there if it has moved.`);
  const available = new Map(files.map(f => [f.webkitRelativePath.split("/").slice(1).join("/"), f]));
  const missing = missingOriginals(album, available);
  if (missing.length) throw new Error(missingMessage(album, missing));
  const selected = album.photos.filter(p => p.selected).map(p => available.get(p.originalRelativePath || p.name));
  if (!selected.length) throw new Error("No photos have been selected.");
  const url = URL.createObjectURL(await originalsZip(selected));
  const link = document.createElement("a");
  link.href = url; link.download = `${album.folderName.replace(/[^a-z0-9_-]/gi, "_")}-selected.zip`; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
