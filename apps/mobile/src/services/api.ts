// src/api.ts — tiny fetch client for the Wam Mfugo API (same contract as web remoteApi)
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import type {
  AnimalStats,
  ApiResponse,
  Filters,
  Farmer,
  HealthStatus,
  KIAMISRegistrationResponse,
  Livestock,
} from "@wam-mfugo/shared";

export type { ApiResponse } from "@wam-mfugo/shared";
import { AUTH_TOKEN_KEY, AUTH_REFRESH_KEY } from "./storage";
import { enqueue } from "./offlineQueue";

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

export function updateAnimal(
  id: number,
  data: Partial<Omit<Livestock, "id">>
): Promise<ApiResponse<Livestock>> {
  return request(`/animals/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteAnimal(
  id: number
): Promise<ApiResponse<{ message: string }>> {
  return request(`/animals/${id}`, { method: "DELETE" });
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

// ── KIAMIS Registration API ─────────────────────────────────────

export interface KIAMISRegistrationPayload {
  animalType: string;
  ownerNationalID: string;
  countyCode: string;
  subCountyCode: string;
  wardCode: string;
  biometricHash: string;
  gpsCoordinates: { lat: number; lng: number };
  timestamp: string;
}

export function registerKIAMIS(
  data: KIAMISRegistrationPayload
): Promise<ApiResponse<KIAMISRegistrationResponse>> {
  return request("/kiamis/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ── Admin API ─────────────────────────────────────────────────────

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  phone: string;
  role: string;
  county: string;
  subCounty?: string;
  isActive: boolean;
  createdAt: string;
}

export interface AdminUsersResponse {
  success: boolean;
  users: AdminUser[];
  total: number;
  page: number;
  limit: number;
}

export interface AdminAuditLog {
  id: number;
  event: string;
  email?: string;
  userId?: number;
  ip?: string;
  metadata?: string;
  createdAt: string;
}

export interface AdminAuditLogsResponse {
  success: boolean;
  data: AdminAuditLog[];
  total: number;
  page: number;
  limit: number;
}

export function getAdminUsers(params?: {
  role?: string;
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}): Promise<AdminUsersResponse> {
  const searchParams = new URLSearchParams();
  if (params?.role) searchParams.set("role", params.role);
  if (params?.search) searchParams.set("search", params.search);
  if (params?.isActive !== undefined) searchParams.set("isActive", String(params.isActive));
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));
  const qs = searchParams.toString();
  return request(`/admin/users${qs ? `?${qs}` : ""}`);
}

export function updateAdminUser(
  id: number,
  data: { role?: string; isActive?: boolean }
): Promise<ApiResponse<AdminUser>> {
  return request(`/admin/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deactivateAdminUser(
  id: number
): Promise<ApiResponse<{ message: string }>> {
  return request(`/admin/users/${id}`, { method: "DELETE" });
}

// ── Vaccinations API ──────────────────────────────────────────────

export interface VaccinationRecord {
  id: number;
  type: string;
  date: string;
  batchNumber: string;
  veterinarian: string;
  nextDueDate?: string;
  animalId: number;
  animalName: string;
  animalType: string;
  owner: string;
  county: string;
}

export function getVaccinations(): Promise<ApiResponse<VaccinationRecord[]>> {
  return request("/vaccinations");
}

export function updateVaccination(
  id: number,
  data: { type?: string; date?: string; batchNumber?: string; veterinarian?: string; nextDueDate?: string | null }
): Promise<ApiResponse<VaccinationRecord>> {
  return request(`/vaccinations/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// ── Outbreaks API ─────────────────────────────────────────────────

export interface OutbreakRecord {
  id: number;
  diseaseType: string;
  affectedAnimals: number;
  suspectedAnimals: number;
  county: string;
  reportedBy: string;
  reportedAt: string;
  symptoms: string[];
  actions: string[];
  status: string;
}

export function getOutbreaks(): Promise<ApiResponse<OutbreakRecord[]>> {
  return request("/outbreaks");
}

export function reportOutbreak(data: {
  diseaseType: string;
  affectedAnimals: number;
  county: string;
  lat: number;
  lng: number;
  reportedBy: string;
  symptoms?: string[];
  actions?: string[];
}): Promise<ApiResponse<OutbreakRecord>> {
  return request("/outbreaks", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateOutbreak(
  id: number,
  data: { status?: string; diseaseType?: string; affectedAnimals?: number; symptoms?: string[]; actions?: string[] }
): Promise<ApiResponse<OutbreakRecord>> {
  return request(`/outbreaks/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function getAdminAuditLogs(params?: {
  event?: string;
  email?: string;
  page?: number;
  limit?: number;
}): Promise<AdminAuditLogsResponse> {
  const searchParams = new URLSearchParams();
  if (params?.event) searchParams.set("event", params.event);
  if (params?.email) searchParams.set("email", params.email);
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));
  const qs = searchParams.toString();
  return request(`/admin/audit-logs${qs ? `?${qs}` : ""}`);
}

// ── Notifications API ─────────────────────────────────────────────

export function registerPushToken(
  token: string
): Promise<ApiResponse<{ success: boolean }>> {
  return request("/notifications/register", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
}

export function unregisterPushToken(
  token: string
): Promise<ApiResponse<{ success: boolean }>> {
  return request("/notifications/register", {
    method: "DELETE",
    body: JSON.stringify({ token }),
  });
}

// ── Disease Prediction API ──────────────────────────────────────────

export interface DiseaseRiskRecord {
  id: number;
  county: string;
  diseaseType: string;
  riskLevel: string;
  confidence: number;
  factors: { name: string; weight: number; value: number; description: string }[];
  lastCalculated: string;
}

export function predictDiseaseRisk(data: {
  county: string;
  diseaseType?: string;
  season?: string;
}): Promise<ApiResponse<DiseaseRiskRecord[]>> {
  return request("/diseases/predict/risk", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getDiseaseRisks(params?: {
  county?: string;
  diseaseType?: string;
  riskLevel?: string;
}): Promise<ApiResponse<DiseaseRiskRecord[]>> {
  const searchParams = new URLSearchParams();
  if (params?.county) searchParams.set("county", params.county);
  if (params?.diseaseType) searchParams.set("diseaseType", params.diseaseType);
  if (params?.riskLevel) searchParams.set("riskLevel", params.riskLevel);
  const qs = searchParams.toString();
  return request(`/diseases/risk${qs ? `?${qs}` : ""}`);
}

export function getCountyRiskSummary(
  county: string
): Promise<
  ApiResponse<{
    county: string;
    totalDiseases: number;
    riskBreakdown: { critical: number; high: number; medium: number; low: number };
    highestRisk: string;
  }>
> {
  return request(`/diseases/risk/${encodeURIComponent(county)}`);
}

// ── Vaccination Coverage API ───────────────────────────────────────

export interface VaccinationCoverageRecord {
  county: string;
  totalAnimals: number;
  vaccinatedAnimals: number;
  coveragePercent: number;
  vaccinationTypes: Record<string, number>;
  lastVaccinated?: string;
}

export function getVaccinationCoverage(): Promise<ApiResponse<VaccinationCoverageRecord[]>> {
  return request("/stats/vaccination-coverage");
}

// ── Mortality API ──────────────────────────────────────────────────

export interface MortalityRecord {
  id: number;
  animalId: number;
  animalName: string;
  animalType: string;
  cause: string;
  diseaseName: string | null;
  reportedBy: string;
  reportedAt: string;
  notes: string | null;
  county: string;
  owner: string;
}

export function getMortalities(params?: {
  county?: string;
  cause?: string;
  page?: number;
  limit?: number;
}): Promise<ApiResponse<MortalityRecord[]>> {
  const searchParams = new URLSearchParams();
  if (params?.county) searchParams.set("county", params.county);
  if (params?.cause) searchParams.set("cause", params.cause);
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));
  const qs = searchParams.toString();
  return request(`/mortality${qs ? `?${qs}` : ""}`);
}

export function reportMortality(data: {
  animalId: number;
  cause: string;
  diseaseName?: string;
  reportedBy: string;
  notes?: string;
}): Promise<ApiResponse<MortalityRecord>> {
  return request("/mortality", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getMortalityStats(): Promise<
  ApiResponse<{
    total: number;
    recentCount: number;
    byCause: { cause: string; count: number }[];
    byCounty: { county: string; count: number }[];
  }>
> {
  return request("/mortality/stats");
}

// ── Weight Tracking API ────────────────────────────────────────────

export interface WeightRecord {
  id: number;
  animalId: number;
  animalName: string;
  animalType: string;
  weight: number;
  unit: string;
  recordedAt: string;
  recordedBy: string;
  notes: string | null;
  county: string;
}

export interface WeightGainStat {
  animalId: number;
  animalName: string;
  animalType: string;
  county: string;
  firstWeight: number;
  latestWeight: number;
  gain: number;
  gainPercent: number;
  recordCount: number;
  firstRecorded: string;
  lastRecorded: string;
  unit: string;
}

export function getWeightRecords(params?: {
  animalId?: number;
  county?: string;
  page?: number;
  limit?: number;
}): Promise<ApiResponse<WeightRecord[]>> {
  const searchParams = new URLSearchParams();
  if (params?.animalId) searchParams.set("animalId", String(params.animalId));
  if (params?.county) searchParams.set("county", params.county);
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));
  const qs = searchParams.toString();
  return request(`/weight${qs ? `?${qs}` : ""}`);
}

export function getAnimalWeightHistory(animalId: number): Promise<ApiResponse<WeightRecord[]>> {
  return request(`/weight/animal/${animalId}`);
}

export function getWeightGainStats(params?: {
  county?: string;
  animalId?: number;
}): Promise<ApiResponse<WeightGainStat[]>> {
  const searchParams = new URLSearchParams();
  if (params?.county) searchParams.set("county", params.county);
  if (params?.animalId) searchParams.set("animalId", String(params.animalId));
  const qs = searchParams.toString();
  return request(`/weight/stats${qs ? `?${qs}` : ""}`);
}

export function recordWeight(data: {
  animalId: number;
  weight: number;
  unit?: string;
  recordedBy: string;
  notes?: string;
}): Promise<ApiResponse<WeightRecord>> {
  return request("/weight", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ── Vaccination Reminders API ────────────────────────────────────

export interface VaccinationReminder {
  id: number;
  type: string;
  date: string;
  nextDueDate: string;
  batchNumber: string;
  veterinarian: string;
  animalName: string;
  animalType: string;
  owner: string;
  county: string;
}

export function getVaccinationReminders(daysAhead?: number): Promise<ApiResponse<VaccinationReminder[]>> {
  const qs = daysAhead ? `?daysAhead=${daysAhead}` : "";
  return request(`/vaccinations/reminders${qs}`);
}

// ── Offline-aware API wrapper ─────────────────────────────────────

export async function isOnline(): Promise<boolean> {
  const state = await NetInfo.fetch();
  return state.isConnected === true && state.isInternetReachable !== false;
}

export interface QueuedResponse {
  queued: true;
  queueId: string;
  message: string;
}

/**
 * Wrapper that auto-queues mutations when offline.
 * Returns the API response normally when online, or a QueuedResponse when offline.
 * GET requests are never queued — they throw if offline.
 */
export async function apiCall<T>(
  method: "POST" | "PATCH" | "DELETE",
  path: string,
  body?: unknown
): Promise<T | QueuedResponse> {
  const online = await isOnline();
  if (!online) {
    const item = await enqueue(method, path, body);
    return {
      queued: true,
      queueId: item.id,
      message: "Queued — will sync when online",
    };
  }
  return request<T>(path, {
    method,
    ...(body != null ? { body: JSON.stringify(body) } : {}),
  });
}
