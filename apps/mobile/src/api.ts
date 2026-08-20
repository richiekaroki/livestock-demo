// src/api.ts — tiny fetch client for the Wam Mfugo API (same contract as web remoteApi)
import AsyncStorage from "@react-native-async-storage/async-storage";
import type {
  AnimalStats,
  ApiResponse,
  Filters,
  Farmer,
  HealthStatus,
  Livestock,
} from "@wam-mfugo/shared";
import { AUTH_TOKEN_KEY, AUTH_REFRESH_KEY } from "./storage";

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000/api";

async function getToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

async function tryRefresh(): Promise<boolean> {
  try {
    const refreshToken = await AsyncStorage.getItem(AUTH_REFRESH_KEY);
    if (!refreshToken) return false;

    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
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

    await AsyncStorage.setItem(AUTH_TOKEN_KEY, data.data.accessToken);
    await AsyncStorage.setItem(AUTH_REFRESH_KEY, data.data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getToken();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...init,
  });

  if (res.status === 401 && token) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      return request<T>(path, init);
    }
    await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, AUTH_REFRESH_KEY]);
    throw new Error("Session expired. Please sign in again.");
  }

  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`);
  }
  return (await res.json()) as T;
}

export function getAnimals(filters?: Filters): Promise<ApiResponse<Livestock[]>> {
  const params = new URLSearchParams();
  if (filters?.type) params.set("type", filters.type);
  if (filters?.health) params.set("health", filters.health);
  if (filters?.county) params.set("county", filters.county);
  const qs = params.toString();

  return request(`/animals${qs ? `?${qs}` : ""}`);
}

export function createAnimal(
  data: Omit<Livestock, "id">
): Promise<ApiResponse<Livestock>> {
  return request("/animals", { method: "POST", body: JSON.stringify(data) });
}

export function updateAnimalHealth(
  id: number,
  health: HealthStatus
): Promise<ApiResponse<Livestock | null>> {
  return request(`/animals/${id}/health`, {
    method: "PATCH",
    body: JSON.stringify({ health }),
  });
}

export function getAnimalStatistics(): Promise<ApiResponse<AnimalStats>> {
  return request("/stats");
}

export function getFarmers(): Promise<ApiResponse<Farmer[]>> {
  return request("/farmers");
}
