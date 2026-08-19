// src/services/backend.ts
import { mockAPI } from "./mockApi";
import { remoteApi } from "./remoteApi";

const useRemote =
  Boolean(import.meta.env.VITE_API_BASE_URL) &&
  import.meta.env.VITE_OFFLINE_MODE !== "true";

export const backend = useRemote ? remoteApi : mockAPI;