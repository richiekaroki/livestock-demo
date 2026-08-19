// src/services/apiClient.ts
import { config } from "../utils/environment";

const BASE_URL = config.api.baseUrl;
const TIMEOUT_MS = config.api.timeout;
const RETRY_ATTEMPTS = config.api.retryAttempts;

interface RequestOptions extends RequestInit {
  retries?: number;
}

async function request<T>(path: string, init: RequestOptions = {}): Promise<T> {
  const retries = init.retries ?? RETRY_ATTEMPTS;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...init.headers,
      },
    });

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