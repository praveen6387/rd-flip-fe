import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { backendUrl, ENDPOINTS } from "@/lib/api/endpoints";
import {
  ACCESS_COOKIE,
  JUST_REFRESHED_COOKIE,
  REFRESH_COOKIE,
} from "@/lib/api/cookie-names";
import { ROUTES } from "@/lib/routes";

const cookieOptions = {
  path: "/",
  sameSite: "lax",
  httpOnly: false,
};

function safeNextPath(next) {
  if (
    !next ||
    !next.startsWith("/dashboard") ||
    next.startsWith("//") ||
    next.includes("://")
  ) {
    return ROUTES.dashboard;
  }

  return next;
}

function loginRedirect(request) {
  const response = NextResponse.redirect(new URL(ROUTES.login, request.url));
  response.cookies.set(ACCESS_COOKIE, "", { ...cookieOptions, maxAge: 0 });
  response.cookies.set(REFRESH_COOKIE, "", { ...cookieOptions, maxAge: 0 });
  response.cookies.set(JUST_REFRESHED_COOKIE, "", { ...cookieOptions, maxAge: 0 });
  return response;
}

export async function GET(request) {
  if (request.nextUrl.searchParams.get("giveup") === "1") {
    return loginRedirect(request);
  }

  const next = safeNextPath(request.nextUrl.searchParams.get("next"));
  const cookieStore = await cookies();
  const refresh = cookieStore.get(REFRESH_COOKIE)?.value;

  if (!refresh) {
    return loginRedirect(request);
  }

  const response = await fetch(backendUrl(ENDPOINTS.refresh), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
    cache: "no-store",
  });
  const result = await response.json().catch(() => null);
  const tokens = result?.data?.tokens;

  if (!response.ok || result?.status !== "success" || !tokens?.access) {
    return loginRedirect(request);
  }

  const redirectResponse = NextResponse.redirect(new URL(next, request.url));
  redirectResponse.cookies.set(ACCESS_COOKIE, tokens.access, cookieOptions);
  if (tokens.refresh) {
    redirectResponse.cookies.set(REFRESH_COOKIE, tokens.refresh, cookieOptions);
  }
  redirectResponse.cookies.set(JUST_REFRESHED_COOKIE, "1", {
    ...cookieOptions,
    maxAge: 20,
  });
  return redirectResponse;
}
