// src/services/healthCheck.ts
export const healthCheck = {
  async checkAPI(): Promise<boolean> {
    try {
      const response = await fetch("/api/health");
      return response.ok;
    } catch {
      return false;
    }
  },

  async checkStorage(): Promise<boolean> {
    try {
      localStorage.setItem("health-check", "test");
      localStorage.removeItem("health-check");
      return true;
    } catch {
      return false;
    }
  },
};
