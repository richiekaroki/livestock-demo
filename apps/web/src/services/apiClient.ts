// src/services/apiClient.ts
import { config } from "../utils/environment";

const BASE_URL = config.api.baseUrl;
const TIMEOUT_MS = config.api.timeout;
const RETRY_ATTEMPTS = config.api.retryAttempts;

const TOKEN_KEY = "wam_auth_token";
const REFRESH_KEY = "wam_auth_refresh";

interface RequestOptions extends RequestInit {
  retries?: number;
}

function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function getRefreshToken(): string | null {
  try {
    return localStorage.getItem(REFRESH_KEY);
  } catch {
    return null;
  }
}

let refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) return false;

  const data = (await res.json()) as {
    success: boolean;
    data?: { accessToken: string; refreshToken: string };
  };
  if (!data.success || !data.data) return false;

  localStorage.setItem(TOKEN_KEY, data.data.accessToken);
  localStorage.setItem(REFRESH_KEY, data.data.refreshToken);
  return true;
}

async function request<T>(path: string, init: RequestOptions = {}): Promise<T> {
  const retries = init.retries ?? RETRY_ATTEMPTS;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const token = getToken();

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
    });

    if (res.status === 401 && token) {
      // Attempt token refresh once
      if (!refreshPromise) {
        refreshPromise = tryRefresh();
      }
      const refreshed = await refreshPromise;
      refreshPromise = null;

      if (refreshed) {
        return request<T>(path, init);
      }
      // Refresh failed, clear auth
      try {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_KEY);
      } catch {}
      throw new Error("Session expired. Please sign in again.");
    }

    if (!res.ok) {
      throw new Error(`Request failed with status ${res.status}`);
    }

    return (await res.json()) as T;
  } catch (err) {
    const isRetryable =
      err instanceof Error && (err.name === "AbortError" || err.name === "TypeError");
    if (isRetryable && retries > 0) {
      return request<T>(path, { ...init, retries: retries - 1 });
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export const apiGet = <T>(path: string): Promise<T> => request<T>(path);

export const apiPost = <T>(path: string, body: unknown): Promise<T> =>
  request<T>(path, { method: "POST", body: JSON.stringify(body) });

export const apiPatch = <T>(path: string, body: unknown): Promise<T> =>
  request<T>(path, { method: "PATCH", body: JSON.stringify(body) });

export const apiDelete = <T>(path: string): Promise<T> =>
  request<T>(path, { method: "DELETE" });
