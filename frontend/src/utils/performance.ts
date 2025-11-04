// src/utils/performance.ts
export const trackApiCall = (endpoint: string, duration: number, success: boolean) => {
  if (process.env.NODE_ENV === "development") {
    console.log(`API: ${endpoint} - ${duration.toFixed(2)}ms - ${success ? "OK" : "FAILED"}`);
  }
  // In production, integrate with analytics service
};
