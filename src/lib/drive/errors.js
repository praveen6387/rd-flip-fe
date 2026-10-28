export function driveFailure(error, fallback = "Google Drive is unavailable. Please try again later.") {
  const code = error?.response?.data?.error;
  if (code === "invalid_grant" || error?.message?.includes("invalid_grant")) {
    return {
      status: 503,
      code: "drive_reconnect_required",
      message: "Google Drive connection has expired or was revoked. The app owner must reconnect Drive and update GOOGLE_OAUTH_REFRESH_TOKEN in the frontend hosting environment before retrying this draft. No new folder is needed.",
    };
  }
  return { status: 503, code: "drive_storage_unavailable", message: error?.message || fallback };
}
