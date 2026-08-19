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
} from "@wam-mfugo/shared";
import { apiGet, apiPatch, apiPost } from "./apiClient";

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
};