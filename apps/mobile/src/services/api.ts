// src/api.ts — tiny fetch client for the Wam Mfugo API (same contract as web remoteApi)
import NetInfo from "@react-native-community/netinfo";
import type {
  AnimalStats,
  ApiResponse,
  Filters,
  Farmer,
  KIAMISRegistrationResponse,
  Livestock,
} from "@wam-mfugo/shared";

export type { ApiResponse, Livestock } from "@wam-mfugo/shared";
import { AUTH_TOKEN_KEY, AUTH_REFRESH_KEY, API_BASE_URL, secureStorage } from "./storage";
import { enqueue } from "./offlineQueue";
import { refreshSocketToken } from "./socket";

async function getToken(): Promise<string | null> {
  try {
    return await secureStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

async function tryRefresh(): Promise<boolean> {
  try {
    const refreshToken = await secureStorage.getItem(AUTH_REFRESH_KEY);
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

    await secureStorage.setItem(AUTH_TOKEN_KEY, data.data.accessToken);
    await secureStorage.setItem(AUTH_REFRESH_KEY, data.data.refreshToken);
    // Update socket with new token
    refreshSocketToken().catch(() => {});
    return true;
  } catch {
    return false;
  }
}

async function request<T>(path: string, init?: RequestInit, _retryCount = 0): Promise<T> {
  const token = await getToken();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...init,
  });

  if (res.status === 401 && token && _retryCount < 1) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      return request<T>(path, init, _retryCount + 1);
    }
    await secureStorage.deleteItem(AUTH_TOKEN_KEY);
    await secureStorage.deleteItem(AUTH_REFRESH_KEY);
    throw new Error("Session expired. Please sign in again.");
  }

  if (!res.ok) {
    if (res.status >= 500) throw new Error("Server error. Please try again later.");
    if (res.status === 403) throw new Error("You don't have permission for this action.");
    if (res.status === 404) throw new Error("Resource not found.");
    if (res.status === 429) throw new Error("Too many requests. Please wait a moment and try again.");
    throw new Error("Something went wrong. Please try again.");
  }
  return (await res.json()) as T;
}

export function getAnimals(filters?: Filters & { limit?: number }): Promise<ApiResponse<Livestock[]>> {
  const params = new URLSearchParams();
  if (filters?.type) params.set("type", filters.type);
  if (filters?.health) params.set("health", filters.health);
  if (filters?.county) params.set("county", filters.county);
  if (filters?.limit) params.set("limit", String(filters.limit));
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
  vaccine: string;
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

export interface MortalityStats {
  total: number;
  recentCount: number;
  byCause: { cause: string; count: number }[];
  byCounty: { county: string; count: number }[];
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

export function getMortalityStats(): Promise<ApiResponse<MortalityStats>> {
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

// ── County Comparison API ────────────────────────────────────────

export interface CountyData {
  county: string;
  totalAnimals: number;
  healthy: number;
  sick: number;
  underTreatment: number;
  recovered: number;
  healthyRate: number;
  animalTypes: Record<string, number>;
  vaccinatedCount: number;
  vaccinationRate: number;
  mortalityCount: number;
  mortalityRate: number;
  outbreakCount: number;
  outbreakDiseases: string[];
}

export function getCountyComparison(): Promise<ApiResponse<CountyData[]>> {
  return request("/stats/county-comparison");
}

// ── What-If Simulator API ────────────────────────────────────────

export interface SimulationResult {
  county: string;
  scenario: {
    vaccinationIncrease: number;
    livestockReduction: number;
    season: string;
  };
  results: {
    diseaseType: string;
    currentRiskLevel: string;
    projectedRiskLevel: string;
    change: string;
    factors: { name: string; weight: number; description: string }[];
  }[];
}

export function simulateWhatIf(data: {
  county: string;
  vaccinationIncrease?: number;
  livestockReduction?: number;
}): Promise<ApiResponse<SimulationResult>> {
  return request("/diseases/simulate", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getCounties(): Promise<ApiResponse<{ name: string; code: string }[]>> {
  return request("/counties");
}

// ── Health Assessment API ────────────────────────────────────────

export interface HealthAssessmentResult {
  overallStatus: string;
  confidence: number;
  findings: { category: string; status: string; description: string; confidence: number }[];
  recommendations: string[];
}

export function assessHealth(data: {
  imageBase64: string;
  animalType: string;
  animalName?: string;
  notes?: string;
}): Promise<ApiResponse<HealthAssessmentResult>> {
  return request("/health-assessment", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ── CSV Import API ───────────────────────────────────────────────

export async function importAnimalsCsv(fileUri: string, fileName: string): Promise<ApiResponse<{ imported: number; errors: string[] }>> {
  const token = await getToken();
  const form = new FormData();
  form.append("file", { uri: fileUri, name: fileName, type: "text/csv" } as any);
  const res = await fetch(`${API_BASE_URL}/animals/import`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  return res.json();
}

// ── Animal Photo Upload API ────────────────────────────────────

/**
 * Upload an animal photo to the server.
 * @param fileUri - local file URI from camera/expo-image-picker
 * @param fileName - filename (e.g. "photo.jpg")
 * @returns the public URL of the uploaded image
 */
export async function uploadAnimalPhoto(
  fileUri: string,
  fileName: string
): Promise<ApiResponse<{ url: string }>> {
  const token = await getToken();
  const form = new FormData();
  form.append("file", {
    uri: fileUri,
    name: fileName,
    type: "image/jpeg",
  } as any);
  const res = await fetch(`${API_BASE_URL}/upload/animal-photo`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  return res.json();
}

// ── Bulk Operations API ──────────────────────────────────────────

export async function bulkHealthUpdate(ids: number[], health: string): Promise<ApiResponse<{ updated: number }>> {
  return request("/animals/bulk/health", {
    method: "POST",
    body: JSON.stringify({ ids, health }),
  });
}

export async function bulkDelete(ids: number[]): Promise<ApiResponse<{ deleted: number }>> {
  return request("/animals/bulk/delete", {
    method: "POST",
    body: JSON.stringify({ ids }),
  });
}

// ── Session Management API ───────────────────────────────────────

export interface Session {
  id: string;
  deviceInfo: string;
  ipAddress: string;
  lastActive: string;
  createdAt: string;
}

export function getSessions(): Promise<ApiResponse<Session[]>> {
  return request("/auth/sessions");
}

export function revokeSession(id: string): Promise<ApiResponse<{ success: boolean }>> {
  return request(`/auth/sessions/${id}`, { method: "DELETE" });
}

export function revokeAllSessions(): Promise<ApiResponse<{ success: boolean }>> {
  return request("/auth/sessions", { method: "DELETE" });
}

// ── KALRO Report API ────────────────────────────────────────────

export function getKalroReport(filters?: {
  type?: string;
  health?: string;
  county?: string;
}): Promise<ApiResponse<any[]>> {
  const params = new URLSearchParams();
  if (filters?.type) params.set("type", filters.type);
  if (filters?.health) params.set("health", filters.health);
  if (filters?.county) params.set("county", filters.county);
  const qs = params.toString();
  return request(`/animals?limit=1000${qs ? `&${qs}` : ""}`);
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
