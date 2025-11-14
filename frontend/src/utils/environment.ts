// src/utils/environment.ts - ENHANCED VERSION

/**
 * Environment Configuration for Mifugo360
 *
 * Centralized configuration management following 12-factor app principles.
 * Supports development, staging, and production environments.
 *
 * Why this matters for MifugoLink:
 * - Separates dev/prod configs (critical for government API integration)
 * - AWS-ready architecture (matches their EC2, S3, RDS stack)
 * - Feature flags for gradual rollout (important when scaling to 22M+ animals)
 */

export const config = {
  // Environment detection
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,

  // API Configuration
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || "/api",
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || "10000", 10),
    retryAttempts: parseInt(import.meta.env.VITE_RETRY_ATTEMPTS || "3", 10),
  },

  // KALRO Integration (Kenya Agricultural and Livestock Research Organisation)
  kalro: {
    baseUrl: import.meta.env.VITE_KALRO_API_URL || "https://demo.kalro.local",
    clientId: import.meta.env.VITE_KALRO_CLIENT_ID || "demo-client",
    clientSecret: import.meta.env.VITE_KALRO_CLIENT_SECRET || "demo-secret",
    enabled: import.meta.env.VITE_ENABLE_KALRO_SYNC === "true",
    syncInterval: 300000, // 5 minutes in milliseconds
  },

  // KIAMIS Integration (Kenya Integrated Agriculture Management Information System)
  kiamis: {
    baseUrl: import.meta.env.VITE_KIAMIS_API_URL || "https://demo.kiamis.local",
    apiKey: import.meta.env.VITE_KIAMIS_API_KEY || "demo-key",
  },

  // AWS Configuration (MifugoLink Infrastructure)
  aws: {
    region: import.meta.env.VITE_AWS_REGION || "af-south-1", // Cape Town - closest to Kenya
    s3: {
      bucket: import.meta.env.VITE_AWS_S3_BUCKET || "mifugo360-biometrics",
      // For biometric photos: nose prints, ear tags
      biometricFolder: "biometrics/",
      // For animal photos
      animalPhotosFolder: "animals/",
    },
    rds: {
      endpoint: import.meta.env.VITE_AWS_RDS_ENDPOINT || "",
      database: "mifugo360_production",
    },
    // Note: In production, credentials should come from AWS IAM roles, not env vars
    credentials: {
      accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID || "",
      secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || "",
    },
  },

  // Feature Flags (Progressive Rollout Strategy)
  features: {
    // Offline-first mode (critical for rural Kenya connectivity)
    offlineMode: import.meta.env.VITE_OFFLINE_MODE !== "false",

    // Auto-sync when connection restored
    autoSync: import.meta.env.VITE_AUTO_SYNC !== "false",

    // Biometric capture (nose prints, ear tags)
    biometricCapture: import.meta.env.VITE_ENABLE_BIOMETRIC_CAPTURE === "true",

    // KALRO veterinary records sync
    veterinarySync: import.meta.env.VITE_ENABLE_KALRO_SYNC === "true",
  },

  // Logging Configuration
  logging: {
    level: import.meta.env.VITE_LOG_LEVEL || "info",
    enableConsole: import.meta.env.DEV,
    // In production, logs should go to AWS CloudWatch
    enableCloudWatch: import.meta.env.PROD,
  },

  // Storage Configuration
  storage: {
    // localStorage key prefix to avoid conflicts
    keyPrefix: "mifugo360_",

    // Version for cache invalidation
    version: "v2",

    // Max items to store offline (prevent quota issues)
    maxOfflineRecords: 1000,
  },

  // Map Configuration (Leaflet)
  map: {
    // Kenya's geographic center
    defaultCenter: {
      lat: -0.0236,
      lng: 37.9062,
    },
    defaultZoom: 6.5,

    // OpenStreetMap tile server
    tileServer: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",

    // Cluster radius (how close markers should be to cluster)
    clusterRadius: 50,
  },

  // Validation Rules
  validation: {
    // Kenyan National ID format: 7-8 digits
    nationalIdPattern: /^\d{7,8}$/,

    // Kenyan phone number format: +254XXXXXXXXX
    phonePattern: /^\+254[17]\d{8}$/,

    // Animal name: 2-50 characters
    animalNameMinLength: 2,
    animalNameMaxLength: 50,
  },
};

/**
 * Helper function to check if a feature is enabled
 * Useful for conditional rendering: if (isFeatureEnabled('biometricCapture')) { ... }
 */
export const isFeatureEnabled = (
  feature: keyof typeof config.features
): boolean => {
  return config.features[feature];
};

/**
 * Helper function to get AWS S3 URL for a resource
 */
export const getS3Url = (path: string): string => {
  const { region, s3 } = config.aws;
  return `https://${s3.bucket}.s3.${region}.amazonaws.com/${path}`;
};

/**
 * Helper function to validate Kenyan National ID
 */
export const isValidKenyanNationalId = (id: string): boolean => {
  return config.validation.nationalIdPattern.test(id);
};

/**
 * Helper function to validate Kenyan phone number
 */
export const isValidKenyanPhone = (phone: string): boolean => {
  return config.validation.phonePattern.test(phone);
};

// Export for testing
export default config;
