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
};