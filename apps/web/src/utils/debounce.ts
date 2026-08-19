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
export type DebouncedFunction<Args extends unknown[]> = ((
  ...args: Args
) => void) & {
  cancel: () => void;
};

export function debounce<Args extends unknown[]>(
  func: (...args: Args) => unknown,
  delay: number
): DebouncedFunction<Args> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const debounced = function (...args: Args) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      timeoutId = null;
      func(...args);
    }, delay);
  } as DebouncedFunction<Args>;

  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debounced;
}