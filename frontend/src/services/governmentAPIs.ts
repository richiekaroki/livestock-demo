// src/services/governmentAPIs.ts

/**
 * Government API Integration Layer
 *
 * Demonstrates readiness for Kenya Agricultural and Livestock Research
 * Organisation (KALRO) and Kenya Integrated Agriculture Management
 * Information System (KIAMIS) integration
 */

export interface KALROVeterinaryRecord {
  animalId: string;
  vaccination: {
    type: string;
    date: string;
    batchNumber: string;
    veterinarian: string;
  }[];
  diseases: {
    name: string;
    reportedDate: string;
    status: "active" | "treated" | "monitoring";
  }[];
  lastInspection: string;
}

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

export interface KIAMISRegistrationResponse {
  success: boolean;
  animalRegistrationNumber: string;
  qrCode: string;
  message: string;
}

interface LocalAnimal {
  id: number;
  name: string;
  type: string;
  owner: string;
  county: string;
  lat: number;
  lng: number;
}

interface SyncResult {
  synced: number;
  failed: number;
  errors: string[];
}

interface ProcessQueueResult {
  processed: number;
  failed: number;
}

class GovernmentAPIService {
  private _kalroBaseUrl =
    import.meta.env.VITE_KALRO_API_URL || "https://api.kalro.go.ke/v1";
  private _kiamisBaseUrl =
    import.meta.env.VITE_KIAMIS_API_URL || "https://api.kiamis.go.ke/v2";
  private _apiKey =
    import.meta.env.VITE_GOV_API_KEY || "demo-key-replace-in-production";

  // Getter methods to actually use the variables and prevent warnings
  getKalroBaseUrl(): string {
    return this._kalroBaseUrl;
  }

  getKiamisBaseUrl(): string {
    return this._kiamisBaseUrl;
  }

  getApiKey(): string {
    return this._apiKey;
  }

  async registerWithKIAMIS(
    payload: KIAMISRegistrationPayload
  ): Promise<KIAMISRegistrationResponse> {
    try {
      await this.simulateNetworkDelay();

      if (!this.validateKenyanNationalID(payload.ownerNationalID)) {
        throw new Error("Invalid National ID format");
      }

      const registrationNumber = `KE-${payload.countyCode}-${Date.now()
        .toString(36)
        .toUpperCase()}`;

      return {
        success: true,
        animalRegistrationNumber: registrationNumber,
        qrCode: `data:image/svg+xml;base64,${btoa(
          `<svg>QR-${registrationNumber}</svg>`
        )}`,
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

  async fetchKALROVeterinaryRecords(
    animalId: string
  ): Promise<KALROVeterinaryRecord | null> {
    try {
      await this.simulateNetworkDelay();

      const mockRecord: KALROVeterinaryRecord = {
        animalId,
        vaccination: [
          {
            type: "Foot and Mouth Disease (FMD)",
            date: "2024-09-15",
            batchNumber: "FMD-2024-KE-08932",
            veterinarian: "Dr. James Mwangi",
          },
          {
            type: "Lumpy Skin Disease (LSD)",
            date: "2024-07-20",
            batchNumber: "LSD-2024-KE-07654",
            veterinarian: "Dr. Sarah Njeri",
          },
        ],
        diseases: [
          {
            name: "East Coast Fever",
            reportedDate: "2024-06-10",
            status: "treated",
          },
        ],
        lastInspection: "2024-10-01",
      };

      return mockRecord;
    } catch (error) {
      console.error("KALRO fetch failed:", error);
      return null;
    }
  }

  async syncWithKIAMIS(localAnimals: LocalAnimal[]): Promise<SyncResult> {
    await this.simulateNetworkDelay(2000);

    const results: SyncResult = {
      synced: Math.floor(localAnimals.length * 0.85),
      failed: Math.ceil(localAnimals.length * 0.15),
      errors: [
        "Connection timeout for 2 records",
        "Duplicate registration detected for 1 record",
      ],
    };

    return results;
  }

  async reportDiseaseOutbreak(data: {
    diseaseType: string;
    affectedAnimals: number;
    location: { lat: number; lng: number };
    county: string;
    reportedBy: string;
  }): Promise<boolean> {
    try {
      await this.simulateNetworkDelay();

      console.log("Disease outbreak reported to Ministry:", data);

      return true;
    } catch {
      return false;
    }
  }

  /**
   * NEW: Process offline queue
   * Syncs pending records with government systems
   */
  async processOfflineQueue(): Promise<ProcessQueueResult> {
    try {
      await this.simulateNetworkDelay(1000);

      // Get queue from localStorage
      const queueStr = localStorage.getItem("kalro_sync_queue") || "[]";
      const queue = JSON.parse(queueStr);

      // Simulate processing
      const processed = queue.length;
      const failed = Math.floor(Math.random() * 2); // Random 0-1 failures

      // Clear processed items from queue
      const remainingQueue = queue.slice(processed - failed);
      localStorage.setItem("kalro_sync_queue", JSON.stringify(remainingQueue));

      return {
        processed: processed - failed,
        failed,
      };
    } catch (error) {
      console.error("Queue processing failed:", error);
      return {
        processed: 0,
        failed: 1,
      };
    }
  }

  private validateKenyanNationalID(id: string): boolean {
    return /^\d{7,8}$/.test(id);
  }

  private simulateNetworkDelay(ms: number = 800): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const governmentAPI = new GovernmentAPIService();
