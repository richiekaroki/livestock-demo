// src/services/__tests__/healthCheck.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { healthCheck } from "../healthCheck";

describe("healthCheck", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // -----------------------------
  // checkAPI
  // -----------------------------
  describe("checkAPI", () => {
    it("returns true when API responds with ok", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({ ok: true } as Response)
      );

      const result = await healthCheck.checkAPI();
      expect(result).toBe(true);
      expect(fetch).toHaveBeenCalledWith("/api/health");
    });

    it("returns false when API responds with non-ok status", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({ ok: false } as Response)
      );

      const result = await healthCheck.checkAPI();
      expect(result).toBe(false);
    });

    it("returns false when fetch throws", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockRejectedValue(new Error("Network error"))
      );

      const result = await healthCheck.checkAPI();
      expect(result).toBe(false);
    });
  });

  // -----------------------------
  // checkStorage
  // -----------------------------
  describe("checkStorage", () => {
    it("returns true when localStorage is available", async () => {
      const result = await healthCheck.checkStorage();
      expect(result).toBe(true);
      // Verify cleanup
      expect(localStorage.getItem("health-check")).toBeNull();
    });

    it("returns false when localStorage throws", async () => {
      const setItemSpy = vi
        .spyOn(Storage.prototype, "setItem")
        .mockImplementation(() => {
          throw new Error("Storage full");
        });

      const result = await healthCheck.checkStorage();
      expect(result).toBe(false);

      setItemSpy.mockRestore();
    });
  });
});
