// src/config/environment.ts
export const config = {
  isDevelopment: process.env.NODE_ENV === "development",
  api: {
    baseUrl: process.env.REACT_APP_API_URL || "/api",
    timeout: parseInt(process.env.REACT_APP_API_TIMEOUT || "10000"),
    retryAttempts: parseInt(process.env.REACT_APP_RETRY_ATTEMPTS || "3"),
  },
  features: {
    offlineMode: process.env.REACT_APP_OFFLINE_MODE !== "false",
    autoRefresh: process.env.REACT_APP_AUTO_REFRESH !== "false",
  },
};
