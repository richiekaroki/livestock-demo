// src/storage.ts — Cross-platform secure storage + AsyncStorage cache
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import type { Livestock } from "@wam-mfugo/shared";
import { logger } from "../utils/logger";

const CACHE_KEY = "wam_animals_cache";

export const AUTH_TOKEN_KEY = "wam_auth_token";
export const AUTH_USER_KEY = "wam_auth_user";
export const AUTH_REFRESH_KEY = "wam_auth_refresh";

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000/api";

// Cross-platform secure storage (expo-secure-store on native, localStorage on web)
async function getSecureItem(key: string): Promise<string | null> {
  try {
    if (Platform.OS === "web") {
      return localStorage.getItem(key);
    }
    const SecureStore = await import("expo-secure-store");
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

async function setSecureItem(key: string, value: string): Promise<void> {
  try {
    if (Platform.OS === "web") {
      localStorage.setItem(key, value);
      return;
    }
    const SecureStore = await import("expo-secure-store");
    await SecureStore.setItemAsync(key, value);
  } catch {
    // Silently fail — token storage is non-critical on web
  }
}

async function deleteSecureItem(key: string): Promise<void> {
  try {
    if (Platform.OS === "web") {
      localStorage.removeItem(key);
      return;
    }
    const SecureStore = await import("expo-secure-store");
    await SecureStore.deleteItemAsync(key);
  } catch {
    // Silently fail
  }
}

export const secureStorage = {
  getItem: getSecureItem,
  setItem: setSecureItem,
  deleteItem: deleteSecureItem,
};

// ── Animal cache ─────────────────────────────────────

export async function saveAnimalsCache(animals: Livestock[]): Promise<void> {
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(animals));
  } catch (error) {
    logger.warn("Failed to save offline cache:", error);
  }
}

export async function loadAnimalsCache(): Promise<Livestock[] | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as Livestock[]) : null;
  } catch (error) {
    logger.warn("Failed to load offline cache:", error);
    return null;
  }
}
