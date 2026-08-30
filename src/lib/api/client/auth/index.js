import { ENDPOINTS } from "@/lib/api/endpoints";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/api/cookie-names";

const USER_STORAGE_KEY = "dashboard_user";

function readCookie(name) {
  if (typeof document === "undefined") return null;

  const match = document.cookie.match(
    new RegExp(`(?:^|; )${name}=([^;]*)`)
  );
  return match ? decodeURIComponent(match[1]) : null;
}

function writeCookie(name, value) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; SameSite=Lax`;
}

function clearCookie(name) {
  document.cookie = `${name}=; path=/; Max-Age=0; SameSite=Lax`;
}

export function setAuthCookies({ access, refresh }) {
  if (access) writeCookie(ACCESS_COOKIE, access);
  if (refresh) writeCookie(REFRESH_COOKIE, refresh);
}

function clearAuthCookies() {
  clearCookie(ACCESS_COOKIE);
  clearCookie(REFRESH_COOKIE);
}

export function getStoredUser() {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user) {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem(USER_STORAGE_KEY);
  clearAuthCookies();
}

export function getAccessToken() {
  return readCookie(ACCESS_COOKIE);
}

export function getRefreshToken() {
  return readCookie(REFRESH_COOKIE);
}

export function hasAccessToken() {
  return Boolean(getAccessToken());
}

export const SESSION_EXPIRED_EVENT = "rd-flip:session-expired";

function goToLogin() {
  clearAuth();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
  }
}

let refreshInFlight = null;

async function refreshSession() {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    const refresh = getRefreshToken();
    if (!refresh) return false;

    const response = await fetch(ENDPOINTS.refresh, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });
    const result = await response.json().catch(() => null);

    if (!response.ok || result?.status !== "success" || !result.data?.tokens?.access) {
      return false;
    }

    setAuthCookies(result.data.tokens);
    return true;
  })().finally(() => {
    refreshInFlight = null;
  });

  return refreshInFlight;
}

export async function authenticatedFetch(url, options = {}) {
  const headers = new Headers(options.headers);
  const access = getAccessToken();

  if (access) {
    headers.set("Authorization", `Bearer ${access}`);
  }

  const response = await fetch(url, { ...options, headers });
  if (response.status !== 401) return response;

  const refreshed = await refreshSession();
  if (!refreshed) {
    goToLogin();
    return response;
  }

  const retryHeaders = new Headers(options.headers);
  retryHeaders.set("Authorization", `Bearer ${getAccessToken()}`);
  return fetch(url, { ...options, headers: retryHeaders });
}

async function authRequest(url, payload, fallbackMessage) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (!response.ok || result.status === "fail") {
    throw new Error(result.message || fallbackMessage);
  }

  if (result.data?.tokens) {
    setAuthCookies(result.data.tokens);
  }

  return result;
}

export async function signup(payload) {
  return authRequest(ENDPOINTS.signup, payload, "Signup failed");
}

export async function login(payload) {
  return authRequest(ENDPOINTS.login, payload, "Login failed");
}

export async function updateSocialLinks(payload) {
  const response = await authenticatedFetch(ENDPOINTS.updateProfile, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (!response.ok || result.status === "fail") {
    throw new Error(result.message || "Failed to update social links");
  }

  if (result.data?.user) {
    setStoredUser(result.data.user);
  }

  return result;
}
