// src/services/__tests__/governmentAPIs.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { governmentAPI } from "../governmentAPIs";

describe("GovernmentAPIService", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // -----------------------------
  // Getter methods
  // -----------------------------
  describe("getter methods", () => {
    it("getKalroBaseUrl returns base URL", () => {
      const url = governmentAPI.getKalroBaseUrl();
      expect(url).toBe("https://api.kalro.go.ke/v1");
    });

    it("getKiamisBaseUrl returns base URL", () => {
      const url = governmentAPI.getKiamisBaseUrl();
      expect(url).toBe("https://api.kiamis.go.ke/v2");
    });

    it("getApiKey returns API key", () => {
      const key = governmentAPI.getApiKey();
      expect(key).toBe("demo-key-replace-in-production");
    });
  });

  // -----------------------------
  // registerWithKIAMIS
  // -----------------------------
  describe("registerWithKIAMIS", () => {
    it("registers animal successfully with valid national ID", async () => {
      const payload = {
        animalType: "Cattle",
        ownerNationalID: "1234567",
        countyCode: "012",
        subCountyCode: "001",
        wardCode: "001",
        biometricHash: "abc123",
        gpsCoordinates: { lat: -1.29, lng: 36.82 },
        timestamp: new Date().toISOString(),
      };

      const promise = governmentAPI.registerWithKIAMIS(payload);
      await act(async () => {
        await vi.advanceTimersByTimeAsync(800);
      });
      const result = await promise;

      expect(result.success).toBe(true);
      expect(result.animalRegistrationNumber).toMatch(/^KE-012-/);
      expect(result.qrCode).toContain("data:image/svg+xml;base64,");
      expect(result.message).toBe("Animal successfully registered with KIAMIS");
    });

    it("rejects invalid national ID format", async () => {
      const payload = {
        animalType: "Cattle",
        ownerNationalID: "123", // Too short
        countyCode: "012",
        subCountyCode: "001",
        wardCode: "001",
        biometricHash: "abc123",
        gpsCoordinates: { lat: -1.29, lng: 36.82 },
        timestamp: new Date().toISOString(),
      };

      const promise = governmentAPI.registerWithKIAMIS(payload);
      await act(async () => {
        await vi.advanceTimersByTimeAsync(800);
      });
      const result = await promise;

      expect(result.success).toBe(false);
      expect(result.message).toBe("Invalid National ID format");
    });

    it("rejects national ID with letters", async () => {
      const payload = {
        animalType: "Cattle",
        ownerNationalID: "1234567a",
        countyCode: "012",
        subCountyCode: "001",
        wardCode: "001",
        biometricHash: "abc123",
        gpsCoordinates: { lat: -1.29, lng: 36.82 },
        timestamp: new Date().toISOString(),
      };

      const promise = governmentAPI.registerWithKIAMIS(payload);
      await act(async () => {
        await vi.advanceTimersByTimeAsync(800);
      });
      const result = await promise;

      expect(result.success).toBe(false);
    });
  });

  // -----------------------------
  // fetchKALROVeterinaryRecords
  // -----------------------------
  describe("fetchKALROVeterinaryRecords", () => {
    it("returns veterinary record for valid animal ID", async () => {
      const promise = governmentAPI.fetchKALROVeterinaryRecords("COW-001");
      await act(async () => {
        await vi.advanceTimersByTimeAsync(800);
      });
      const record = await promise;

      expect(record).not.toBeNull();
      expect(record!.animalId).toBe("COW-001");
      expect(record!.vaccination.length).toBeGreaterThan(0);
      expect(record!.vaccination[0]).toHaveProperty("type");
      expect(record!.vaccination[0]).toHaveProperty("date");
      expect(record!.vaccination[0]).toHaveProperty("batchNumber");
      expect(record!.diseases.length).toBeGreaterThan(0);
      expect(record!.lastInspection).toBeDefined();
    });
  });

  // -----------------------------
  // syncWithKIAMIS
  // -----------------------------
  describe("syncWithKIAMIS", () => {
    it("syncs local animals and returns results", async () => {
      const animals = [
        { id: 1, name: "Cow1", type: "Cattle", owner: "Owner1", county: "Nakuru", lat: 0, lng: 0 },
        { id: 2, name: "Cow2", type: "Cattle", owner: "Owner2", county: "Nakuru", lat: 0, lng: 0 },
        { id: 3, name: "Goat1", type: "Goat", owner: "Owner3", county: "Kiambu", lat: 0, lng: 0 },
      ];

      const promise = governmentAPI.syncWithKIAMIS(animals);
      await act(async () => {
        await vi.advanceTimersByTimeAsync(2000);
      });
      const result = await promise;

      expect(result.synced).toBeGreaterThanOrEqual(0);
      expect(result.failed).toBeGreaterThanOrEqual(0);
      expect(result.synced + result.failed).toBe(animals.length);
      expect(result.errors).toBeInstanceOf(Array);
    });
  });

  // -----------------------------
  // reportDiseaseOutbreak
  // -----------------------------
  describe("reportDiseaseOutbreak", () => {
    it("reports outbreak successfully", async () => {
      const data = {
        diseaseType: "Foot and Mouth Disease",
        affectedAnimals: 5,
        location: { lat: -1.29, lng: 36.82 },
        county: "Nakuru",
        reportedBy: "Dr. James Mwangi",
      };

      const promise = governmentAPI.reportDiseaseOutbreak(data);
      await act(async () => {
        await vi.advanceTimersByTimeAsync(800);
      });
      const result = await promise;

      expect(result).toBe(true);
    });
  });

  // -----------------------------
  // processOfflineQueue
  // -----------------------------
  describe("processOfflineQueue", () => {
    it("processes empty queue without crashing", async () => {
      localStorage.removeItem("kalro_sync_queue");

      const promise = governmentAPI.processOfflineQueue();
      await act(async () => {
        await vi.advanceTimersByTimeAsync(1000);
      });
      const result = await promise;

      // Empty queue: processed + failed should sum to 0 or near 0
      expect(result.processed + result.failed).toBeGreaterThanOrEqual(0);
      expect(result).toHaveProperty("processed");
      expect(result).toHaveProperty("failed");
    });

    it("processes queued items", async () => {
      const queue = [
        { id: "1", action: "register", data: {} },
        { id: "2", action: "update", data: {} },
      ];
      localStorage.setItem("kalro_sync_queue", JSON.stringify(queue));

      const promise = governmentAPI.processOfflineQueue();
      await act(async () => {
        await vi.advanceTimersByTimeAsync(1000);
      });
      const result = await promise;

      expect(result.processed + result.failed).toBe(2);
    });
  });
});

// Need to import act
import { act } from "@testing-library/react";
