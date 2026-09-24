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
  changePassword: "/api/auth/change-password/",
  forgotPassword: "/api/auth/forgot-password/",
  resetPassword: "/api/auth/reset-password/",
  flipbooks: "/api/flipbooks/",
  flipbooksCreate: "/api/flipbooks/create/",
  flipbooksDelete: (id) => `/api/flipbooks/${id}/`,
  plans: "/api/plans/",
  ordersCreate: "/api/orders/create/",
  paymentsVerify: "/api/payments/verify/",
  settingsLegal: "/api/settings/legal/",
  contactCreate: "/api/contact/create/",
};

export function backendUrl(path) {
  return `${BACKEND_ORIGIN}${path}`;
}
