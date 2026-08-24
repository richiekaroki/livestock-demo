// src/services/remoteApi.ts
import type {
  AnimalStats,
  ApiResponse,
  Filters,
  HealthStatus,
  Livestock,
  Farmer,
  County,
  AnimalTypeInfo,
  KALROVeterinaryRecord,
  KIAMISRegistrationResponse,
  AuthResponse,
  SessionInfo,
  User,
} from "@wam-mfugo/shared";
import { apiDelete, apiGet, apiPatch, apiPost } from "./apiClient";

interface KIAMISRegistrationPayload {
  animalType: string;
  ownerNationalID: string;
  countyCode: string;
  subCountyCode: string;
  wardCode: string;
  biometricHash: string;
  gpsCoordinates: { lat: number; lng: number };
  timestamp: string;
}

interface OutbreakReportPayload {
  diseaseType: string;
  affectedAnimals: number;
  county: string;
  lat: number;
  lng: number;
  reportedBy: string;
  symptoms?: string[];
}

interface DiseaseRiskPayload {
  county: string;
  diseaseType?: string;
  season?: string;
}

const toQueryString = (filters?: Filters): string => {
  const params = new URLSearchParams();
  if (filters?.type) params.set("type", filters.type);
  if (filters?.health) params.set("health", filters.health);
  if (filters?.county) params.set("county", filters.county);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
};

export const remoteApi = {
  getAnimals: (filters?: Filters) =>
    apiGet<ApiResponse<Livestock[]>>(`/animals${toQueryString(filters)}`),

  createAnimal: (animalData: Omit<Livestock, "id">) =>
    apiPost<ApiResponse<Livestock>>("/animals", animalData),

  updateAnimal: (animalId: number, data: Partial<Omit<Livestock, "id">>) =>
    apiPatch<ApiResponse<Livestock>>(`/animals/${animalId}`, data),

  deleteAnimal: (animalId: number) =>
    apiDelete<ApiResponse<{ message: string }>>(`/animals/${animalId}`),

  updateAnimalHealth: (animalId: number, healthStatus: HealthStatus) =>
    apiPatch<ApiResponse<Livestock | null>>(`/animals/${animalId}/health`, {
      health: healthStatus,
    }),

  getAnimalStatistics: () => apiGet<ApiResponse<AnimalStats>>("/stats"),

  fetchKALROVeterinaryRecords: (animalId: string) =>
    apiGet<ApiResponse<KALROVeterinaryRecord>>(`/kalro/veterinary/${animalId}`),

  registerWithKIAMIS: (payload: KIAMISRegistrationPayload) =>
    apiPost<ApiResponse<KIAMISRegistrationResponse>>("/kiamis/register", payload),

  reportDiseaseOutbreak: (payload: OutbreakReportPayload) =>
    apiPost<ApiResponse<unknown>>("/outbreaks", payload),

  getCounties: () => apiGet<ApiResponse<County[]>>("/ref/counties"),

  getAnimalTypes: () => apiGet<ApiResponse<AnimalTypeInfo[]>>("/ref/animal-types"),

  getFarmers: () => apiGet<ApiResponse<Farmer[]>>("/farmers"),

  // Auth endpoints
  requestOtp: (email: string) =>
    apiPost<ApiResponse<{ message: string }>>("/auth/request-otp", { email }),

  verifyOtp: (email: string, otp: string) =>
    apiPost<ApiResponse<AuthResponse>>("/auth/verify-otp", { email, otp }),

  register: (data: { email: string; name: string; phone: string; county: string; subCounty?: string }) =>
    apiPost<ApiResponse<{ message: string }>>("/auth/register", data),

  verifyRegistration: (email: string, otp: string) =>
    apiPost<ApiResponse<AuthResponse>>("/auth/verify-registration", { email, otp }),

  refreshToken: (refreshToken: string) =>
    apiPost<ApiResponse<AuthResponse>>("/auth/refresh", { refreshToken }),

  logout: () => apiPost<ApiResponse<{ message: string }>>("/auth/logout", {}),

  getMe: () => apiGet<ApiResponse<Omit<User, "failedOtpAttempts" | "lockedUntil">>>("/auth/me"),

  updateMe: (data: { name?: string; phone?: string; county?: string; subCounty?: string }) =>
    apiPatch<ApiResponse<Omit<User, "failedOtpAttempts" | "lockedUntil">>>("/auth/me", data),

  getSessions: () => apiGet<ApiResponse<SessionInfo[]>>("/auth/sessions"),

  revokeSession: (id: number) => apiDelete<ApiResponse<{ message: string }>>(`/auth/sessions/${id}`),

  revokeAllSessions: () => apiDelete<ApiResponse<{ message: string }>>("/auth/sessions"),

  // Disease prediction endpoints
  predictDiseaseRisk: (payload: DiseaseRiskPayload) =>
    apiPost<ApiResponse<unknown[]>>("/diseases/predict/risk", payload),

  getDiseaseRisks: (query?: { county?: string; diseaseType?: string; riskLevel?: string }) => {
    const params = new URLSearchParams();
    if (query?.county) params.set("county", query.county);
    if (query?.diseaseType) params.set("diseaseType", query.diseaseType);
    if (query?.riskLevel) params.set("riskLevel", query.riskLevel);
    const qs = params.toString();
    return apiGet<ApiResponse<unknown[]>>(`/diseases/risk${qs ? `?${qs}` : ""}`);
  },

  getCountyRiskSummary: (county: string) =>
    apiGet<ApiResponse<unknown>>(`/diseases/risk/${encodeURIComponent(county)}`),

  simulateWhatIf: (data: { county: string; vaccinationIncrease?: number; livestockReduction?: number; season?: string }) =>
    apiPost<ApiResponse<unknown>>("/diseases/simulate", data),

  // Vaccination coverage
  getVaccinationCoverage: () =>
    apiGet<ApiResponse<unknown[]>>("/stats/vaccination-coverage"),

  // Vaccination reminders
  getVaccinationReminders: (daysAhead?: number) =>
    apiGet<ApiResponse<unknown[]>>(`/vaccinations/reminders${daysAhead ? `?daysAhead=${daysAhead}` : ""}`),

  // Health assessment
  assessHealth: (data: { imageUrl: string; animalType: string; animalName?: string; notes?: string }) =>
    apiPost<ApiResponse<unknown>>("/health-assessment", data),

  // Permissions management
  getUserPermissions: (userId: number) =>
    apiGet<ApiResponse<string[]>>(`/admin/users/${userId}/permissions`),
  setUserPermissions: (userId: number, permissions: string[]) =>
    apiPatch<ApiResponse<unknown>>(`/admin/users/${userId}/permissions`, { permissions }),
  getPermissionDefaults: () =>
    apiGet<ApiResponse<Record<string, string[]>>>("/admin/permissions/defaults"),

  // CSV import
  importAnimalsCsv: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const token = localStorage.getItem("wam_auth_token") || "";
    return fetch(
      `${import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api"}/animals/import`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      }
    ).then((r) => r.json()) as Promise<ApiResponse<{ imported: number; errors: string[] }>>;
  },

  // Bulk operations
  bulkUpdateHealth: (ids: number[], health: string) =>
    apiPost<ApiResponse<{ updated: number }>>("/animals/bulk/health", { ids, health }),
  bulkDelete: (ids: number[]) =>
    apiPost<ApiResponse<{ deleted: number }>>("/animals/bulk/delete", { ids }),
  bulkExport: (_ids: number[]) => {
    const token = localStorage.getItem("wam_auth_token") || "";
    window.open(
      `${import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api"}/animals/bulk/export?token=${token}`,
      "_blank"
    );
  },

  // County comparison
  getCountyComparison: () =>
    apiGet<ApiResponse<unknown[]>>("/stats/county-comparison"),

  // Report export
  downloadReport: () => {
    const token = localStorage.getItem("wam_auth_token") || "";
    window.open(
      `${import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api"}/stats/report?token=${token}`,
      "_blank"
    );
  },

  // Mortality tracking
  getMortalities: (query?: { county?: string; cause?: string; page?: number; limit?: number }) => {
    const params = new URLSearchParams();
    if (query?.county) params.set("county", query.county);
    if (query?.cause) params.set("cause", query.cause);
    if (query?.page) params.set("page", String(query.page));
    if (query?.limit) params.set("limit", String(query.limit));
    const qs = params.toString();
    return apiGet<ApiResponse<unknown[]>>(`/mortality${qs ? `?${qs}` : ""}`);
  },

  reportMortality: (data: { animalId: number; cause: string; diseaseName?: string; reportedBy: string; notes?: string }) =>
    apiPost<ApiResponse<unknown>>("/mortality", data),

  getMortalityStats: () =>
    apiGet<ApiResponse<unknown>>("/mortality/stats"),

  // Weight tracking
  getWeightRecords: (query?: { animalId?: number; county?: string; page?: number; limit?: number }) => {
    const params = new URLSearchParams();
    if (query?.animalId) params.set("animalId", String(query.animalId));
    if (query?.county) params.set("county", query.county);
    if (query?.page) params.set("page", String(query.page));
    if (query?.limit) params.set("limit", String(query.limit));
    const qs = params.toString();
    return apiGet<ApiResponse<unknown[]>>(`/weight${qs ? `?${qs}` : ""}`);
  },

  getAnimalWeightHistory: (animalId: number) =>
    apiGet<ApiResponse<unknown[]>>(`/weight/animal/${animalId}`),

  getWeightGainStats: (query?: { county?: string; animalId?: number }) => {
    const params = new URLSearchParams();
    if (query?.county) params.set("county", query.county);
    if (query?.animalId) params.set("animalId", String(query.animalId));
    const qs = params.toString();
    return apiGet<ApiResponse<unknown[]>>(`/weight/stats${qs ? `?${qs}` : ""}`);
  },

  recordWeight: (data: { animalId: number; weight: number; unit?: string; recordedBy: string; notes?: string }) =>
    apiPost<ApiResponse<unknown>>("/weight", data),

  // Upload endpoints
  uploadAnimalPhoto: (file: File): Promise<ApiResponse<{ url: string }>> => {
    const formData = new FormData();
    formData.append("file", file);
    return new Promise((resolve, reject) => {
      fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api"}/upload/animal-photo`, {
        method: "POST",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("wam_auth_token") || ""}`,
        },
        body: formData,
      })
        .then((res) => {
          if (!res.ok) throw new Error(`Upload failed with status ${res.status}`);
          return res.json();
        })
        .then(resolve)
        .catch(reject);
    });
  },
};