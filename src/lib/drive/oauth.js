import { google } from "googleapis";

export const OAUTH_STATE_COOKIE = "drive_oauth_state";

export function driveRedirectUri() {
  return (
    process.env.GOOGLE_OAUTH_REDIRECT_URI ||
    "http://localhost:3000/songs/drive/callback"
  ).trim();
}

export function getOAuthClient() {
  const clientId = (process.env.GOOGLE_OAUTH_CLIENT_ID || "").trim();
  const clientSecret = (process.env.GOOGLE_OAUTH_CLIENT_SECRET || "").trim();
  if (!clientId || !clientSecret) {
    throw new Error(
      "Add GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET in rd-flip-fe/.env."
    );
  }

  return new google.auth.OAuth2(clientId, clientSecret, driveRedirectUri());
}

export function getDriveAuthUrl(state) {
  return getOAuthClient().generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["https://www.googleapis.com/auth/drive"],
    state,
  });
}
