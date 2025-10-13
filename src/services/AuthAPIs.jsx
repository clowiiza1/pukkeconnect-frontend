// authService.js
import axios from 'axios';

const API_ROOT = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

const API = axios.create({
  baseURL: `${API_ROOT}/auth`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Optionally attach token to axios automatically from localStorage
export function setAuthHeader(token) {
  if (token) API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  else delete API.defaults.headers.common['Authorization'];
}

// Register (signup)
export async function register(payload) {
  // payload should contain:
  // { firstName, lastName, universityNumber, phoneNumber, campus, major, password }
  try {
    const res = await API.post('/register', payload);
    // If your backend returns a token on register, store it:
    if (res.data?.token) {
      localStorage.setItem('token', res.data.token);
      setAuthHeader(res.data.token);
    }
    return res.data;
  } catch (err) {
    // unify error shape
    throw formatAxiosError(err);
  }
}

// Login
export async function login({ universityNumber, universityNumberOrEmail, email, password }) {
  // prefer explicit universityNumber, then universityNumberOrEmail, then email
  const identifier = (universityNumber ?? universityNumberOrEmail ?? email ?? '').toString().trim();

  if (!identifier || !password) {
    throw { message: 'University number (or email) and password are required' };
  }

  // backend expects field named `email` (it will treat value without '@' as uni number)
  const payload = { email: identifier, password };

  try {
    const res = await API.post('/login', payload);
    if (res.data?.token) {
      localStorage.setItem('token', res.data.token);
      setAuthHeader(res.data.token);
    }
    return res.data;
  } catch (err) {
    throw formatAxiosError(err);
  }
}

export async function requestPasswordReset(identifier) {
  const trimmed = typeof identifier === "string" ? identifier.trim() : "";
  if (!trimmed) {
    throw { message: "Email or university number is required" };
  }

  try {
    const res = await API.post("/forgot-password", { identifier: trimmed });
    return res.data;
  } catch (err) {
    throw formatAxiosError(err);
  }
}

export async function resetPassword({ userId, token, newPassword }) {
  const payload = {
    userId,
    token,
    newPassword,
  };

  try {
    const res = await API.post("/reset-password", payload);
    return res.data;
  } catch (err) {
    throw formatAxiosError(err);
  }
}

export function logout() {
  localStorage.removeItem('token');
  setAuthHeader(null);
}

// helper: return currently stored user info (if you store user in localStorage)
export function getCurrentUser() {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;
    // Optionally decode token on client (not secure for secret info) or call /me endpoint
    return { token };
  } catch {
    return null;
  }
}

function formatAxiosError(err) {
  if (err.response) {
    // server responded with status and data
    return { status: err.response.status, data: err.response.data, message: err.response.data?.message || err.message };
  }
  return { status: null, message: err.message };
}

// Export default if you prefer object import
export default {
  register,
  login,
  logout,
  getCurrentUser,
  setAuthHeader,
  requestPasswordReset,
  resetPassword,
};
