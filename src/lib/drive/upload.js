import fs from "fs";
import https from "https";
import path from "path";
import { Readable } from "stream";
import { google } from "googleapis";
import { getOAuthClient } from "./oauth";

const MAX_SONG_BYTES = 20 * 1024 * 1024;
const FILE_ID_PATTERN = /^[a-zA-Z0-9_-]+$/;

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

function httpsRequest(url, { method, headers, body }) {
  return new Promise((resolve, reject) => {
    const target = new URL(url);
    const req = https.request(
      {
        hostname: target.hostname,
        path: `${target.pathname}${target.search}`,
        method,
        headers,
      },
      (res) => {
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => {
          resolve({
            status: res.statusCode || 0,
            headers: res.headers,
            body: Buffer.concat(chunks).toString("utf8"),
          });
        });
      }
    );
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

async function getAccessToken() {
  const refreshToken = (process.env.GOOGLE_OAUTH_REFRESH_TOKEN || "").trim();
  if (!refreshToken) {
    throw new Error(
      "Song storage is not connected yet. The app owner must connect Google Drive once."
    );
  }

  const auth = getOAuthClient();
  auth.setCredentials({ refresh_token: refreshToken });
  const { token } = await auth.getAccessToken();
  if (!token) {
    throw new Error("Could not get a Google Drive access token.");
  }
  return token;
}

export async function startDriveResumableUpload({ filename, size, origin = "" }) {
  const name = String(filename || "").toLowerCase();
  if (!name.endsWith(".mp3")) {
    throw new Error("Upload an MP3 file.");
  }

  const bytes = Number(size || 0);
  if (!bytes) {
    throw new Error("Choose an MP3 file.");
  }
  if (bytes > MAX_SONG_BYTES) {
    throw new Error("Song must be 20 MB or smaller.");
  }

  const folderId = (process.env.GOOGLE_DRIVE_FOLDER_ID || "").trim();
  if (!folderId) {
    throw new Error("GOOGLE_DRIVE_FOLDER_ID is missing.");
  }

  const songName = nameFromFilename(filename);
  const token = await getAccessToken();
  const payload = JSON.stringify({
    name: `${songName}.mp3`,
    parents: [folderId],
  });
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json; charset=UTF-8",
    "Content-Length": String(Buffer.byteLength(payload)),
    "X-Upload-Content-Type": "audio/mpeg",
    "X-Upload-Content-Length": String(bytes),
  };
  if (origin) headers.Origin = origin;

  const started = await httpsRequest(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id",
    {
      method: "POST",
      headers,
      body: payload,
    }
  );

  if (started.status < 200 || started.status >= 300) {
    throw new Error("Could not start the Google Drive upload.");
  }

  const location = started.headers.location;
  const sessionUri = Array.isArray(location) ? location[0] : location;
  if (!sessionUri) {
    throw new Error("Drive did not return an upload session.");
  }

  return { sessionUri, name: songName };
}

export async function completeDriveUpload(fileId, name) {
  const id = String(fileId || "").trim();
  if (!FILE_ID_PATTERN.test(id)) {
    throw new Error("Invalid song file.");
  }

  const drive = getOwnerDriveClient();
  await drive.permissions.create({
    fileId: id,
    requestBody: { type: "anyone", role: "reader" },
  });

  return {
    name: String(name || "Song").trim().slice(0, 255) || "Song",
    audio_url: `/songs/stream/${id}`,
  };
}

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

