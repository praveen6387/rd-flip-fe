const BACKEND_ORIGIN = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(
  /\/$/,
  ""
);

export const ENDPOINTS = {
  login: "/api/auth/login/",
  signup: "/api/auth/signup/",
  refresh: "/api/auth/refresh/",
  me: "/api/auth/me/",
  updateProfile: "/api/auth/me/",
  flipbooks: "/api/flipbooks/",
  flipbooksCreate: "/api/flipbooks/create/",
};

export function backendUrl(path) {
  return `${BACKEND_ORIGIN}${path}`;
}
