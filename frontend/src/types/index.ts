//  src/types/index.ts

export interface Livestock {
  id: number;
  name: string;
  type: "Cattle" | "Goat" | "Sheep" | "Camel";
  health: "Healthy" | "Sick" | "Under Treatment" | "Recovered";
  county: string;
  owner: string;
  lat: number;
  lng: number;
  createdAt?: string;
}

export interface AnimalStats {
  totalAnimals: number;
  healthyCount: number;
  sickCount: number;
  underTreatmentCount: number;
  recoveredCount: number;
  counties: number;
  lastUpdated: string;
}

export interface Filters {
  type: string;
  health: string;
  county: string;
}

export interface ApiResponse<T> {
  data: T;
  total?: number;
  page?: number;
  limit?: number;
  success: boolean;
  error?: string;
  message?: string;
}
