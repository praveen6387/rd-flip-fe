import { ENDPOINTS } from "@/api/endpoints";

const USER_STORAGE_KEY = "dashboard_user";

function setAuthCookies({ access, refresh }) {
  document.cookie = `dashboard_access_token=${access}; path=/; SameSite=Lax`;
  document.cookie = `dashboard_refresh_token=${refresh}; path=/; SameSite=Lax`;
}

function clearAuthCookies() {
  document.cookie = "dashboard_access_token=; path=/; Max-Age=0; SameSite=Lax";
  document.cookie = "dashboard_refresh_token=; path=/; Max-Age=0; SameSite=Lax";
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
  if (typeof document === "undefined") return null;

  const match = document.cookie.match(
    /(?:^|; )dashboard_access_token=([^;]*)/
  );
  return match ? decodeURIComponent(match[1]) : null;
}

export function hasAccessToken() {
  return Boolean(getAccessToken());
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
