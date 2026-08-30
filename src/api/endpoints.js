const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const ENDPOINTS = {
  login: `${API_BASE_URL}/api/auth/login/`,
  signup: `${API_BASE_URL}/api/auth/signup/`,
  me: `${API_BASE_URL}/api/auth/me/`,
  updateProfile: `${API_BASE_URL}/api/auth/me/`,
  flipbooks: `${API_BASE_URL}/api/flipbooks/`,
};
