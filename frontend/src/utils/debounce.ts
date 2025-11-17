// src/utils/debounce.ts
/**
 * Debounce Utility Function
 *
 * Delays execution of a function until after a specified delay has elapsed
 * since the last time it was invoked. Critical for performance optimization
 * in search inputs and API calls.
 *
 * Use case: Search bar with 22M+ records - prevents excessive filtering
 *
 * @param func - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function (...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

/**
 * Throttle Utility Function
 *
 * Ensures a function is called at most once per specified interval.
 * Useful for scroll events, window resizing, etc.
 *
 * @param func - Function to throttle
 * @param limit - Minimum time between calls (ms)
 * @returns Throttled function
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;

  return function (...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}