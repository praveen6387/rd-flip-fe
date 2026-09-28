import fs from "fs";
import path from "path";
import { Readable } from "stream";
import { google } from "googleapis";
import { getOAuthClient } from "./oauth";

const MAX_SONG_BYTES = 20 * 1024 * 1024;

function nameFromFilename(filename) {
  const base = String(filename || "")
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .trim();
  return base.slice(0, 255) || "Song";
}

export function saveRefreshToken(refreshToken) {
  const token = String(refreshToken || "").trim();
  if (!token) {
    throw new Error("Google did not return a refresh token. Connect Google Drive again.");
  }

  process.env.GOOGLE_OAUTH_REFRESH_TOKEN = token;

  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return token;

  const envText = fs.readFileSync(envPath, "utf8");
  const line = `GOOGLE_OAUTH_REFRESH_TOKEN=${token}`;
  const next = envText.includes("GOOGLE_OAUTH_REFRESH_TOKEN=")
    ? envText.replace(/^GOOGLE_OAUTH_REFRESH_TOKEN=.*$/m, line)
    : `${envText.replace(/\s*$/, "\n")}${line}\n`;
  fs.writeFileSync(envPath, next, "utf8");
  return token;
}

export function getOwnerDriveClient() {
  const refreshToken = (process.env.GOOGLE_OAUTH_REFRESH_TOKEN || "").trim();
  if (!refreshToken) {
    throw new Error(
      "Song storage is not connected yet. The app owner must connect Google Drive once."
    );
  }

  const auth = getOAuthClient();
  auth.setCredentials({ refresh_token: refreshToken });
  return google.drive({ version: "v3", auth });
}

export async function uploadMp3ToDrive(file) {
  if (!(file instanceof File) || !file.size) {
    throw new Error("Choose an MP3 file.");
  }

  const name = (file.name || "").toLowerCase();
  const type = (file.type || "").toLowerCase();
  if (!name.endsWith(".mp3") && type !== "audio/mpeg" && type !== "audio/mp3") {
    throw new Error("Upload an MP3 file.");
  }

  if (file.size > MAX_SONG_BYTES) {
    throw new Error("Song must be 20 MB or smaller.");
  }

  const folderId = (process.env.GOOGLE_DRIVE_FOLDER_ID || "").trim();
  if (!folderId) {
    throw new Error("GOOGLE_DRIVE_FOLDER_ID is missing.");
  }

  const drive = getOwnerDriveClient();
  const songName = nameFromFilename(file.name);
  const buffer = Buffer.from(await file.arrayBuffer());

  const created = await drive.files.create({
    requestBody: {
      name: `${songName}.mp3`,
      parents: [folderId],
    },
    media: {
      mimeType: "audio/mpeg",
      body: Readable.from(buffer),
    },
    fields: "id",
  });

  const fileId = created.data?.id;
  if (!fileId) {
    throw new Error("Drive upload did not return a file id.");
  }

  await drive.permissions.create({
    fileId,
    requestBody: { type: "anyone", role: "reader" },
  });

  return {
    name: songName,
    audio_url: `/songs/stream/${fileId}`,
  };
}

const FILE_ID_PATTERN = /^[a-zA-Z0-9_-]+$/;

export async function streamDriveMp3(fileId) {
  const id = String(fileId || "")
    .trim()
    .replace(/\.mp3$/i, "");
  if (!FILE_ID_PATTERN.test(id)) {
    throw new Error("Invalid song file.");
  }

  const drive = getOwnerDriveClient();
  const meta = await drive.files.get({
    fileId: id,
    fields: "size",
    supportsAllDrives: true,
  });
  const size = Number(meta.data?.size || 0);

  const result = await drive.files.get(
    {
      fileId: id,
      alt: "media",
      supportsAllDrives: true,
    },
    { responseType: "stream" }
  );

  const body = Readable.toWeb(result.data);
  const headers = {
    "Content-Type": "audio/mpeg",
    "Content-Disposition": 'inline; filename="song.mp3"',
    "Accept-Ranges": "bytes",
    "Cache-Control": "public, max-age=3600",
  };
  if (size > 0) headers["Content-Length"] = String(size);

  return { body, status: 200, headers };
}

