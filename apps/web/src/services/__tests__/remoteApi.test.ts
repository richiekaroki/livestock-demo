// src/services/__tests__/remoteApi.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { remoteApi } from "../remoteApi";

const mockFetch = vi.fn();

const jsonResponse = (body: unknown, ok = true, status = 200) => ({
  ok,
  status,
  json: vi.fn().mockResolvedValue(body),
});

describe("remoteApi", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", mockFetch);
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("getAnimals hits /animals with a filter query string", async () => {
    mockFetch.mockResolvedValue(jsonResponse({ success: true, data: [] }));
    await remoteApi.getAnimals({ type: "Cattle", health: "Healthy" });

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/animals?type=Cattle&health=Healthy",
      expect.objectContaining({})
    );
  });

  it("getAnimals hits /animals without a query when no filters are given", async () => {
    mockFetch.mockResolvedValue(jsonResponse({ success: true, data: [] }));
    await remoteApi.getAnimals();

    expect(mockFetch).toHaveBeenCalledWith("/api/animals", expect.anything());
  });

  it("createAnimal POSTs a JSON body to /animals", async () => {
    mockFetch.mockResolvedValue(
      jsonResponse({ success: true, data: { id: 1 } })
    );
    await remoteApi.createAnimal({
      name: "Test",
      type: "Cattle",
      health: "Healthy",
      county: "Nakuru",
      owner: "Jane",
      lat: -0.28,
      lng: 36.08,
    });

    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe("/api/animals");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toMatchObject({ name: "Test" });
  });

  it("updateAnimalHealth PATCHes the targeted endpoint", async () => {
    mockFetch.mockResolvedValue(jsonResponse({ success: true, data: null }));
    await remoteApi.updateAnimalHealth(5, "Sick");

    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe("/api/animals/5/health");
    expect(init.method).toBe("PATCH");
    expect(JSON.parse(init.body)).toEqual({ health: "Sick" });
  });

  it("getAnimalStatistics GETs /stats", async () => {
    mockFetch.mockResolvedValue(
      jsonResponse({ success: true, data: { totalAnimals: 8 } })
    );
    const res = await remoteApi.getAnimalStatistics();

    expect(mockFetch).toHaveBeenCalledWith("/api/stats", expect.anything());
    expect(res.data.totalAnimals).toBe(8);
  });

  it("registerWithKIAMIS posts to /kiamis/register", async () => {
    mockFetch.mockResolvedValue(
      jsonResponse({
        success: true,
        data: {
          success: true,
          animalRegistrationNumber: "KE-012-2026-0001",
          qrCode: "",
          message: "ok",
        },
      })
    );

    const res = await remoteApi.registerWithKIAMIS({
      animalType: "Cattle",
      ownerNationalID: "1234567",
      countyCode: "012",
      subCountyCode: "01",
      wardCode: "01",
      biometricHash: "x",
      gpsCoordinates: { lat: -0.28, lng: 36.08 },
      timestamp: "2026-01-01T00:00:00Z",
    });

    expect(mockFetch.mock.calls[0][0]).toBe("/api/kiamis/register");
    expect(res.data.animalRegistrationNumber).toMatch(/^KE-/);
  });

  it("throws on non-ok responses", async () => {
    mockFetch.mockResolvedValue(jsonResponse({}, false, 500));

    await expect(remoteApi.getAnimals()).rejects.toThrow(
      "Something went wrong. Please try again."
    );
  });

  it("retries on network failure then succeeds", async () => {
    mockFetch.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ success: true, data: [] })
    );

    const res = await remoteApi.getAnimals();

    expect(res.success).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});
