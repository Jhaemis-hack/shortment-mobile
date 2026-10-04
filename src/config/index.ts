import axios, { isAxiosError, type AxiosResponse } from "axios";
import { useAuthStore } from "../store/auth-store";

const apiUrl = process.env.EXPO_PUBLIC_API_URL;
if (!apiUrl) {
  throw new Error("EXPO_PUBLIC_API_URL is not set. Copy .env.example to .env and set it.");
}

/**
 * Base URL for API calls and browser flows (Google sign-in), always ending in `/api/v1/`.
 * The prefix is added when the env value is the bare server origin.
 */
const normalizeApiUrl = (url: string): string => {
  const trimmed = url.trim().replace(/\/+$/, "");
  return /\/api\/v1$/.test(trimmed) ? `${trimmed}/` : `${trimmed}/api/v1/`;
};

export const API_BASE_URL = normalizeApiUrl(apiUrl);

// eslint-disable-next-line import/no-named-as-default-member -- the instance factory lives on the default export
export const Axios = axios.create({
  // The hosted API can take 30–60s to wake from sleep.
  timeout: 90_000,
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

Axios.interceptors.request.use(config => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

Axios.interceptors.response.use(
  response => response,
  (error: unknown) => {
    if (isAxiosError(error)) {
      // A 401 on an authenticated request means the session expired or was revoked.
      // 403 is a permission problem, not a logout.
      if (error.response?.status === 401 && error.config?.headers?.Authorization) {
        useAuthStore.getState().clearData();
      }
      if (__DEV__) {
        console.error({ message: error.message, code: error.code, status: error.response?.status });
      }
    }
    return Promise.reject(error);
  },
);

/**
 * The backend wraps every response as `{ status_code, message, data }`.
 * Returns the `data` field (or the whole body if absent) as `unknown`;
 * callers must validate it before use.
 */
export function unwrap(response: AxiosResponse<unknown>): unknown {
  const body = response.data;
  if (typeof body === "object" && body !== null && "data" in body) {
    return body.data;
  }
  return body;
}
