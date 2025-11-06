// src/types/index.ts
export interface Livestock {
  id: number;
  name: string;
  type: "Cattle" | "Goat" | "Sheep" | "Camel" | "Pig" | "Chicken";
  health: "Healthy" | "Sick" | "Under Treatment" | "Recovered";
  county: string;
  owner: string;
  lat: number;
  lng: number;
  createdAt?: string;
  biometricData?: BiometricData;
  governmentRegistration?: GovernmentRegistration;
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

// Utility types (NEW)
export type HealthStatus = Livestock["health"];
export type AnimalType = Livestock["type"];
export type FilterKey = keyof Filters;
export type LivestockFormData = Omit<Livestock, "id" | "createdAt">;
export type LivestockUpdate = Partial<Omit<Livestock, "id">> & { id: number };
export type BiometricType =
  | "nose_print"
  | "facial"
  | "ear_tag"
  | "visual"
  | "hump_pattern"
  | "combined";

/**
 * Biometric Data Interface
 *
 * Supports non-invasive livestock identification methods:
 * - Cattle: Nose print recognition (unique like fingerprints)
 * - Goats/Sheep: Ear tag photos + facial recognition
 * - Camels: Hump pattern analysis
 *
 * Why biometrics matter:
 * - Prevents fraud (same animal registered multiple times)
 * - Enables traceability (disease outbreak tracking)
 * - Supports insurance claims (proof of animal identity)
 */
export interface BiometricData {
  biometricType: BiometricType;
  // Primary identifier (hash of biometric features)
  nosePrintHash?: string;

  // Photo evidence (base64 or S3 URL)
  earTagPhoto?: string | null;
  animalPhoto?: string | null;

  // Metadata
  captureTimestamp: string;
  captureLocation: { lat: number; lng: number };

  // ML confidence score (0-1)
  confidence: number;

  // Capture device info (for audit trail)
  deviceId?: string;
  capturedBy?: string; // User ID or name
}

/**
 * Government Registration Interface
 *
 * Tracks official registration with KALRO/KIAMIS
 */
export interface GovernmentRegistration {
  // KIAMIS registration number (format: KE-{COUNTY}-{YEAR}-{NUMBER})
  registrationNumber: string;

  // QR code for quick verification (base64 or URL)
  qrCode: string;

  // Registration date
  registeredAt: string;

  // KALRO verification status
  verified: boolean;
  verifiedAt?: string;
  verifiedBy?: string;

  // Owner National ID (Kenyan format: 7-8 digits)
  ownerNationalId: string;

  // Location hierarchy (Kenya administrative divisions)
  location: {
    county: string;
    subCounty: string;
    ward: string;
  };
}

/**
 * KALRO Veterinary Record Interface
 *
 * Tracks animal health history from KALRO database
 */
export interface KALROVeterinaryRecord {
  animalId: string;

  // Vaccination history
  vaccination: Array<{
    type: string; // e.g., "Foot and Mouth Disease (FMD)"
    date: string;
    batchNumber: string;
    veterinarian: string;
    nextDueDate?: string;
  }>;

  // Disease history
  diseases: Array<{
    name: string;
    reportedDate: string;
    status: "active" | "treated" | "monitoring";
    treatment?: string;
    treatedBy?: string;
  }>;

  // Inspection records
  lastInspection: string;
  nextInspectionDue?: string;
  inspectionNotes?: string;
}

/**
 * KIAMIS Registration Payload
 *
 * Data structure for registering animal with government system
 */
export interface KIAMISRegistrationPayload {
  animalType: string;
  ownerNationalID: string;

  // Location codes (standardized by Kenya government)
  countyCode: string;
  subCountyCode: string;
  wardCode: string;

  // Biometric identifier
  biometricHash: string;

  // GPS coordinates
  gpsCoordinates: { lat: number; lng: number };

  // Timestamp
  timestamp: string;

  // Optional owner details
  ownerDetails?: {
    name: string;
    phoneNumber: string;
    email?: string;
  };
}

/**
 * KIAMIS Registration Response
 *
 * Response from government registration system
 */
export interface KIAMISRegistrationResponse {
  success: boolean;
  animalRegistrationNumber: string;
  qrCode: string;
  message: string;

  // Additional metadata
  registeredAt?: string;
  expiryDate?: string; // Some registrations expire annually
}

/**
 * Sync Queue Item
 *
 * Tracks operations waiting to sync with KALRO/KIAMIS
 * Critical for offline-first architecture
 */
export interface SyncQueueItem {
  id: string;
  action: "register" | "update" | "vaccinate" | "report_disease";
  data: Record<string, unknown>;
  timestamp: string;
  retryCount: number;
  lastError?: string;
  status: "pending" | "syncing" | "failed" | "completed";
}

/**
 * Disease Outbreak Report
 *
 * Used for reporting to Ministry of Agriculture
 */
export interface DiseaseOutbreakReport {
  diseaseType: string;
  affectedAnimals: number;
  suspectedAnimals: number;
  location: {
    lat: number;
    lng: number;
    county: string;
    subCounty: string;
    ward: string;
  };
  reportedBy: string; // Veterinarian name
  reportedAt: string;
  symptoms: string[];
  actions: string[]; // Actions taken (quarantine, treatment, etc.)
  status: "reported" | "investigating" | "contained" | "resolved";
}

/**
 * Offline Storage Payload
 *
 * Wrapper for data stored in localStorage/IndexedDB
 */
export interface OfflinePayload<T> {
  version: string; // For cache invalidation
  timestamp: string;
  data: T;
  checksum?: string; // Optional data integrity check
}

/**
 * User/Farmer Profile (for future extension)
 *
 * Not implemented yet, but shows forward-thinking architecture
 */
export interface FarmerProfile {
  id: string;
  nationalId: string;
  name: string;
  phoneNumber: string;
  email?: string;

  location: {
    county: string;
    subCounty: string;
    ward: string;
  };

  // Farm details
  farmSize?: number; // in acres
  primaryLivestock: AnimalType[];

  // Membership/Certification
  cooperativeMember?: boolean;
  cooperativeName?: string;
  certifications?: string[];

  // Statistics
  totalAnimals: number;
  registeredAt: string;
  lastActive: string;
}

// ============================================
// TYPE GUARDS (for runtime type checking)
// ============================================

/**
 * Type guard to check if data is valid BiometricData
 */
export function isBiometricData(data: unknown): data is BiometricData {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const bio = data as Record<string, unknown>;

  return (
    typeof bio.captureTimestamp === "string" &&
    typeof bio.confidence === "number" &&
    bio.confidence >= 0 &&
    bio.confidence <= 1
  );
}

/**
 * Type guard to check if data is valid GovernmentRegistration
 */
export function isGovernmentRegistration(
  data: unknown
): data is GovernmentRegistration {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const reg = data as Record<string, unknown>;

  return (
    typeof reg.registrationNumber === "string" &&
    typeof reg.verified === "boolean" &&
    typeof reg.ownerNationalId === "string"
  );
}

/**
 * Type guard to check if data is valid Livestock
 */
export function isLivestock(data: unknown): data is Livestock {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const animal = data as Record<string, unknown>;

  return (
    typeof animal.id === "number" &&
    typeof animal.name === "string" &&
    typeof animal.type === "string"
  );
}

/**
 * Type guard to check if data is valid Livestock array
 */
export function isLivestockArray(data: unknown): data is Livestock[] {
  return Array.isArray(data) && data.every(isLivestock);
}
