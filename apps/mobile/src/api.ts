// src/api.ts — tiny fetch client for the Wam Mfugo API (same contract as web remoteApi)
import type {
  AnimalStats,
  ApiResponse,
  Filters,
  Farmer,
  HealthStatus,
  Livestock,
} from "@wam-mfugo/shared";

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
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