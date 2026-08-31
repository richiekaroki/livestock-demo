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
import { API_BASE, TOKEN_KEY } from "../config";

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
    const token = localStorage.getItem(TOKEN_KEY) || "";
    return fetch(
      `${API_BASE}/animals/import`,
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
  bulkExport: async (ids: number[]) => {
    const token = localStorage.getItem(TOKEN_KEY) || "";
    const res = await fetch(`${API_BASE}/animals/bulk/export`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ids }),
    });
    if (!res.ok) throw new Error("Export failed");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `animals-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  },

  // County comparison
  getCountyComparison: () =>
    apiGet<ApiResponse<unknown[]>>("/stats/county-comparison"),

  // Report export
  downloadReport: async () => {
    const token = localStorage.getItem(TOKEN_KEY) || "";
    const res = await fetch(`${API_BASE}/stats/report`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Report download failed");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kalro-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
      fetch(`${API_BASE}/upload/animal-photo`, {
        method: "POST",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY) || ""}`,
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

// Government API integration (KALRO/KIAMIS stubs)
interface KALROSyncPayload {
  animalType: string;
  ownerNationalID: string;
  countyCode: string;
  subCountyCode: string;
  wardCode: string;
  biometricHash: string;
  gpsCoordinates: { lat: number; lng: number };
  timestamp: string;
}

interface SyncResult {
  synced: number;
  failed: number;
  errors: string[];
}

class GovernmentAPIService {
  private _useRemoteBackend =
    Boolean(import.meta.env.VITE_API_BASE_URL) &&
    import.meta.env.VITE_OFFLINE_MODE !== "true";

  async registerWithKIAMIS(
    payload: KALROSyncPayload
  ): Promise<KIAMISRegistrationResponse> {
    try {
      if (this._useRemoteBackend) {
        const res = await remoteApi.registerWithKIAMIS(payload);
        return res.data;
      }

      await this.simulateNetworkDelay();

      const registrationNumber = `KE-${payload.countyCode}-${Date.now().toString(36).toUpperCase()}`;

      return {
        success: true,
        animalRegistrationNumber: registrationNumber,
        qrCode: `data:image/svg+xml;base64,${btoa(`<svg>QR-${registrationNumber}</svg>`)}`,
        message: "Animal successfully registered with KIAMIS",
      };
    } catch (error) {
      console.error("KIAMIS registration failed:", error);
      return {
        success: false,
        animalRegistrationNumber: "",
        qrCode: "",
        message: error instanceof Error ? error.message : "Registration failed",
      };
    }
  }

  async fetchKALROVeterinaryRecords(animalId: string): Promise<KALROVeterinaryRecord | null> {
    try {
      if (this._useRemoteBackend) {
        const res = await remoteApi.fetchKALROVeterinaryRecords(animalId);
        return res.success ? res.data : null;
      }

      await this.simulateNetworkDelay();

      return {
        animalId,
        vaccination: [
          { type: "FMD", date: "2024-09-15", batchNumber: "FMD-2024-KE-08932", veterinarian: "Dr. James Mwangi" },
          { type: "LSD", date: "2024-07-20", batchNumber: "LSD-2024-KE-07654", veterinarian: "Dr. Sarah Njeri" },
        ],
        diseases: [{ name: "East Coast Fever", reportedDate: "2024-06-10", status: "treated" }],
        lastInspection: "2024-10-01",
      };
    } catch (error) {
      console.error("KALRO fetch failed:", error);
      return null;
    }
  }

  async reportDiseaseOutbreak(data: {
    diseaseType: string;
    affectedAnimals: number;
    county: string;
    lat: number;
    lng: number;
    reportedBy: string;
  }): Promise<boolean> {
    try {
      if (this._useRemoteBackend) {
        const res = await remoteApi.reportDiseaseOutbreak(data);
        return res.success;
      }
      await this.simulateNetworkDelay();
      return true;
    } catch {
      return false;
    }
  }

  async processOfflineQueue(): Promise<{ processed: number; failed: number }> {
    try {
      await this.simulateNetworkDelay(1000);
      const queueStr = localStorage.getItem("kalro_sync_queue") || "[]";
      const queue = JSON.parse(queueStr);
      const processed = queue.length;
      const failed = Math.floor(Math.random() * 2);
      const remainingQueue = queue.slice(processed - failed);
      localStorage.setItem("kalro_sync_queue", JSON.stringify(remainingQueue));
      return { processed: processed - failed, failed };
    } catch (error) {
      console.error("Queue processing failed:", error);
      return { processed: 0, failed: 1 };
    }
  }

  private simulateNetworkDelay(ms: number = 800): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const governmentAPI = new GovernmentAPIService();