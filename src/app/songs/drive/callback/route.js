import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ACCESS_COOKIE } from "@/lib/api/cookie-names";
import { getOAuthClient, OAUTH_STATE_COOKIE } from "@/lib/drive/oauth";
import { saveRefreshToken } from "@/lib/drive/upload";

export const runtime = "nodejs";

function html(title, body) {
  return new NextResponse(
    `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${title}</title>
    <style>
      body { font-family: ui-sans-serif, system-ui, sans-serif; max-width: 40rem; margin: 4rem auto; padding: 0 1.5rem; color: #0f172a; }
      a { color: #0284c7; }
    </style>
  </head>
  <body>
    <h1>${title}</h1>
    <p>${body}</p>
    <p><a href="/dashboard/create-flipbook">Back to create flipbook</a></p>
  </body>
</html>`,
    {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    }
  );
}

export async function GET(request) {
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  if (!token) {
    return html("Sign in required", "Sign in to the dashboard, then connect Google Drive again.");
  }

  const url = request.nextUrl;
  const error = url.searchParams.get("error");
  const code = url.searchParams.get("code") || "";
  const state = url.searchParams.get("state") || "";
  const expected = (await cookies()).get(OAUTH_STATE_COOKIE)?.value || "";

  if (error) {
    return html("Google Drive not connected", `Google returned: ${error}`);
  }

  if (!code || !state || !expected || state !== expected) {
    return html(
      "Google Drive not connected",
      "This connect link expired. Open /songs/drive/connect again."
    );
  }

  try {
    const client = getOAuthClient();
    const { tokens } = await client.getToken(code);
    saveRefreshToken(tokens.refresh_token);
    const response = html(
      "Google Drive connected",
      "All users who sign in with phone will now save songs to this Drive account. They do not need Google login."
    );
    response.cookies.set(OAUTH_STATE_COOKIE, "", { path: "/", maxAge: 0 });
    return response;
  } catch (connectError) {
    return html(
      "Google Drive not connected",
      connectError.message || "Could not save the Google Drive token."
    );
  }
}
