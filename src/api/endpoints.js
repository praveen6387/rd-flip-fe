const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const ENDPOINTS = {
  login: `${API_BASE_URL}/api/auth/login/`,
  signup: `${API_BASE_URL}/api/auth/signup/`,
  flipbooks: `${API_BASE_URL}/api/flipbooks/`,
};
