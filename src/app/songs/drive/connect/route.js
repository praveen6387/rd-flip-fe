import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ACCESS_COOKIE } from "@/lib/api/cookie-names";
import { getDriveAuthUrl, OAUTH_STATE_COOKIE } from "@/lib/drive/oauth";

export const runtime = "nodejs";

export async function GET(request) {
  const token = (await cookies()).get(ACCESS_COOKIE)?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/?login=1", request.url));
  }

  try {
    const state = randomBytes(16).toString("hex");
    const url = getDriveAuthUrl(state);
    const response = NextResponse.redirect(url);
    response.cookies.set(OAUTH_STATE_COOKIE, state, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 600,
    });
    return response;
  } catch (error) {
    return NextResponse.json(
      {
        status: "fail",
        message: error.message || "Google OAuth is not configured.",
      },
      { status: 400 }
    );
  }
}
