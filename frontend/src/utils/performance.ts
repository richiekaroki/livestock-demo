// src/utils/performance.ts

/**
 * Track API call performance
 *
 * Logs API duration and success/failure in development mode.
 * In production, this can be extended to send metrics to an analytics service.
 */
export const trackApiCall = (
  endpoint: string,
  duration: number,
  success: boolean
) => {
  if (import.meta.env.MODE === "development") {
    console.log(
      `API: ${endpoint} - ${duration.toFixed(2)}ms - ${
        success ? "OK" : "FAILED"
      }`
    );
  }
  // In production, integrate with analytics service (e.g., Sentry, Datadog)
};

/**
 * Measure function execution time
 *
 * Useful for benchmarking critical operations.
 *
 * @example
 * const result = await measurePerformance(
 *   () => filterAnimals(largeDataset),
 *   "Filter 100k animals"
 * );
 */
export async function measurePerformance<T>(
  func: () => T | Promise<T>,
  label: string
): Promise<T> {
  const startTime = performance.now();
  const result = await func();
  const endTime = performance.now();
  const duration = endTime - startTime;

  if (import.meta.env.MODE === "development") {
    console.log(`⏱️  ${label}: ${duration.toFixed(2)}ms`);
  }

  return result;
}
