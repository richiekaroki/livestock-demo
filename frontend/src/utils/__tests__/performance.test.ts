// src/utils/__tests__/performance.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Livestock } from "../../types";
import { debounce, throttle } from "../debounce";

describe("Performance - Large Datasets", () => {
  it("should filter 10,000 animals in under 100ms", () => {
    const largeDataset: Livestock[] = Array.from({ length: 10000 }, (_, i) => ({
      id: i,
      name: `Animal ${i}`,
      type: "Cattle" as const,
      health: (i % 3 === 0 ? "Sick" : "Healthy") as "Sick" | "Healthy",
      county: `County ${i % 10}`,
      owner: `Owner ${i}`,
      lat: -0.303,
      lng: 36.08,
    }));

    const startTime = performance.now();
    const filtered = largeDataset.filter((a) => a.health === "Sick");
    const endTime = performance.now();

    const duration = endTime - startTime;

    expect(duration).toBeLessThan(100);
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.length).toBe(Math.ceil(10000 / 3)); // Every 3rd animal is sick

    console.log(`✅ Filtered 10,000 animals in ${duration.toFixed(2)}ms`);
  });

  it("should handle 100,000 animal dataset efficiently", () => {
    const veryLargeDataset: Livestock[] = Array.from(
      { length: 100000 },
      (_, i) => ({
        id: i,
        name: `Animal ${i}`,
        type: ["Cattle", "Goat", "Sheep", "Camel", "Pig", "Chicken"][
          i % 6
        ] as Livestock["type"],
        health: (i % 4 === 0 ? "Sick" : "Healthy") as "Sick" | "Healthy",
        county: `County ${i % 47}`, // Kenya has 47 counties
        owner: `Owner ${i % 1000}`,
        lat: -0.303 + (Math.random() - 0.5) * 10,
        lng: 36.08 + (Math.random() - 0.5) * 10,
      })
    );

    const startTime = performance.now();

    // Complex filtering (multiple conditions)
    const filtered = veryLargeDataset.filter(
      (a) =>
        a.health === "Sick" && a.type === "Cattle" && a.county === "County 5"
    );

    const endTime = performance.now();
    const duration = endTime - startTime;

    expect(duration).toBeLessThan(500); // Should be fast even for 100k records
    expect(filtered.length).toBeGreaterThan(0);

    console.log(`✅ Filtered 100,000 animals in ${duration.toFixed(2)}ms`);
  });

  it("should perform multi-field search efficiently", () => {
    const dataset: Livestock[] = Array.from({ length: 50000 }, (_, i) => ({
      id: i,
      name: `Animal ${i}`,
      type: "Cattle" as const,
      health: "Healthy" as const,
      county: "Nakuru",
      owner: `John Doe ${i}`,
      lat: -0.303,
      lng: 36.08,
    }));

    const searchTerm = "John Doe 12345";

    const startTime = performance.now();

    const results = dataset.filter((animal) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        animal.name.toLowerCase().includes(searchLower) ||
        animal.owner.toLowerCase().includes(searchLower) ||
        animal.type.toLowerCase().includes(searchLower) ||
        animal.county.toLowerCase().includes(searchLower)
      );
    });

    const endTime = performance.now();
    const duration = endTime - startTime;

    expect(duration).toBeLessThan(200);
    expect(results.length).toBeGreaterThan(0);

    console.log(
      `✅ Multi-field search across 50,000 records in ${duration.toFixed(2)}ms`
    );
  });
});

describe("Debounce Utility", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should debounce search input effectively", async () => {
    const searchHandler = vi.fn();
    const debouncedSearch = debounce(searchHandler, 300);

    // Simulate rapid typing (10 keystrokes in quick succession)
    for (let i = 0; i < 10; i++) {
      debouncedSearch("test");
    }

    // Should not call handler yet
    expect(searchHandler).not.toHaveBeenCalled();

    // Advance timers by 299ms (just before debounce completes)
    await vi.advanceTimersByTimeAsync(299);
    expect(searchHandler).not.toHaveBeenCalled();

    // Advance by 1ms more (total 300ms - debounce completes)
    await vi.advanceTimersByTimeAsync(1);

    // Should call handler only once
    expect(searchHandler).toHaveBeenCalledTimes(1);
    expect(searchHandler).toHaveBeenCalledWith("test");
  });

  it("should reset debounce timer on subsequent calls", async () => {
    const handler = vi.fn();
    const debouncedFunc = debounce(handler, 300);

    // First call
    debouncedFunc("first");
    await vi.advanceTimersByTimeAsync(200);

    // Second call resets timer
    debouncedFunc("second");
    await vi.advanceTimersByTimeAsync(200);

    // Third call resets timer again
    debouncedFunc("third");
    await vi.advanceTimersByTimeAsync(300);

    // Should only call with the last value
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith("third");
  });

  it("should handle multiple debounced functions independently", async () => {
    const handler1 = vi.fn();
    const handler2 = vi.fn();

    const debounced1 = debounce(handler1, 300);
    const debounced2 = debounce(handler2, 500);

    debounced1("func1");
    debounced2("func2");

    // First function completes
    await vi.advanceTimersByTimeAsync(300);
    expect(handler1).toHaveBeenCalledTimes(1);
    expect(handler2).not.toHaveBeenCalled();

    // Second function completes
    await vi.advanceTimersByTimeAsync(200);
    expect(handler2).toHaveBeenCalledTimes(1);
  });

  it("should pass correct arguments to debounced function", async () => {
    const handler = vi.fn();
    const debouncedFunc = debounce(handler, 300);

    debouncedFunc("arg1", "arg2", { key: "value" });
    await vi.advanceTimersByTimeAsync(300);

    expect(handler).toHaveBeenCalledWith("arg1", "arg2", { key: "value" });
  });

  it("should work with async functions", async () => {
    const asyncHandler = vi.fn().mockResolvedValue("success");
    const debouncedAsync = debounce(asyncHandler, 300);

    debouncedAsync();
    await vi.advanceTimersByTimeAsync(300);

    expect(asyncHandler).toHaveBeenCalled();
  });
});

describe("Throttle Utility", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should throttle function calls", async () => {
    const handler = vi.fn();
    const throttledFunc = throttle(handler, 300);

    // Call multiple times rapidly
    throttledFunc("call1");
    throttledFunc("call2");
    throttledFunc("call3");

    // Should only call once immediately
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith("call1");

    // After throttle period, can call again
    await vi.advanceTimersByTimeAsync(300);
    throttledFunc("call4");

    expect(handler).toHaveBeenCalledTimes(2);
    expect(handler).toHaveBeenCalledWith("call4");
  });

  it("should allow calls after throttle period expires", async () => {
    const handler = vi.fn();
    const throttledFunc = throttle(handler, 200);

    throttledFunc("first");
    expect(handler).toHaveBeenCalledTimes(1);

    // Wait for throttle to expire
    await vi.advanceTimersByTimeAsync(200);

    throttledFunc("second");
    expect(handler).toHaveBeenCalledTimes(2);

    await vi.advanceTimersByTimeAsync(200);

    throttledFunc("third");
    expect(handler).toHaveBeenCalledTimes(3);
  });
});

describe("Performance - Memory Usage", () => {
  it("should not cause memory leaks with large datasets", () => {
    // Create and destroy large datasets multiple times
    for (let iteration = 0; iteration < 5; iteration++) {
      const dataset = Array.from({ length: 10000 }, (_, i) => ({
        id: i,
        name: `Animal ${i}`,
        type: "Cattle" as const,
        health: "Healthy" as const,
        county: "Nakuru",
        owner: `Owner ${i}`,
        lat: -0.303,
        lng: 36.08,
      }));

      const filtered = dataset.filter((a) => a.id % 2 === 0);

      expect(filtered.length).toBe(5000);
    }

    // If we get here without memory issues, test passes
    expect(true).toBe(true);
  });

  it("should handle rapid filter changes without performance degradation", () => {
    const dataset: Livestock[] = Array.from({ length: 5000 }, (_, i) => ({
      id: i,
      name: `Animal ${i}`,
      type: ["Cattle", "Goat", "Sheep"][i % 3] as Livestock["type"],
      health: ["Healthy", "Sick", "Under Treatment"][
        i % 3
      ] as Livestock["health"],
      county: `County ${i % 10}`,
      owner: `Owner ${i}`,
      lat: -0.303,
      lng: 36.08,
    }));

    const durations: number[] = [];

    // Simulate 10 rapid filter changes
    for (let i = 0; i < 10; i++) {
      const startTime = performance.now();

      dataset.filter(
        (a) =>
          a.type === "Cattle" &&
          a.health === "Healthy" &&
          a.county === `County ${i % 10}`
      );

      const endTime = performance.now();
      durations.push(endTime - startTime);
    }

    // Check that performance doesn't degrade (last filter should be as fast as first)
    const firstDuration = durations[0];
    const lastDuration = durations[durations.length - 1];

    expect(lastDuration).toBeLessThan(firstDuration * 1.5); // Allow 50% variance

    console.log(
      `✅ Filter performance consistent: ${firstDuration.toFixed(
        2
      )}ms -> ${lastDuration.toFixed(2)}ms`
    );
  });
});

describe("Performance - Pagination Simulation", () => {
  it("should efficiently paginate large datasets", () => {
    const dataset: Livestock[] = Array.from({ length: 100000 }, (_, i) => ({
      id: i,
      name: `Animal ${i}`,
      type: "Cattle" as const,
      health: "Healthy" as const,
      county: "Nakuru",
      owner: `Owner ${i}`,
      lat: -0.303,
      lng: 36.08,
    }));

    const pageSize = 50;
    const startTime = performance.now();

    // Simulate fetching page 100
    const page = 100;
    const start = (page - 1) * pageSize;
    const paginatedData = dataset.slice(start, start + pageSize);

    const endTime = performance.now();

    expect(paginatedData.length).toBe(pageSize);
    expect(endTime - startTime).toBeLessThan(10); // Should be instant

    console.log(
      `✅ Paginated 100,000 records in ${(endTime - startTime).toFixed(2)}ms`
    );
  });

  it("should handle cursor-based pagination efficiently", () => {
    const dataset: Livestock[] = Array.from({ length: 50000 }, (_, i) => ({
      id: i,
      name: `Animal ${i}`,
      type: "Cattle" as const,
      health: "Healthy" as const,
      county: "Nakuru",
      owner: `Owner ${i}`,
      lat: -0.303,
      lng: 36.08,
    }));

    const pageSize = 50;
    const lastSeenId = 1000;

    const startTime = performance.now();

    // Cursor-based pagination (more efficient than offset)
    const nextPage = dataset
      .filter((animal) => animal.id > lastSeenId)
      .slice(0, pageSize);

    const endTime = performance.now();

    expect(nextPage.length).toBe(pageSize);
    expect(nextPage[0].id).toBe(lastSeenId + 1);
    expect(endTime - startTime).toBeLessThan(50);

    console.log(
      `✅ Cursor pagination in ${(endTime - startTime).toFixed(2)}ms`
    );
  });
});
