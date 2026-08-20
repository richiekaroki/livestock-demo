// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.ts",
    env: {
      VITE_API_BASE_URL: "",
      VITE_OFFLINE_MODE: "true",
    },
    include: [
      "src/**/__tests__/**/*.{test,spec}.{js,jsx,ts,tsx}",
      "src/test/**/*.{test,spec}.{js,jsx,ts,tsx}",
    ],
    fileParallelism: false,
    testTimeout: 10000,
    hookTimeout: 10000,
    coverage: {
      provider: "v8",
      reportsDirectory: "./coverage",
      reporter: ["text", "html"],
      // Ensure coverage temp directory is created
      clean: true,
      cleanOnRerun: true,
    },
  },
});
