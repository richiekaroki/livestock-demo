// src/services/apiClient.ts
import { config } from "../utils/environment";
import { TOKEN_KEY } from "../config";

const BASE_URL = config.api.baseUrl;
const TIMEOUT_MS = config.api.timeout;
const RETRY_ATTEMPTS = config.api.retryAttempts;

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

let refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) return false;

  const data = (await res.json()) as {
    success: boolean;
    data?: { accessToken: string };
  };
  if (!data.success || !data.data) return false;

  localStorage.setItem(TOKEN_KEY, data.data.accessToken);
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
      credentials: "include",
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
      } catch {
        // localStorage may be unavailable
      }
      throw new Error("Session expired. Please sign in again.");
    }

    if (!res.ok) {
      throw new Error("Something went wrong. Please try again.");
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
