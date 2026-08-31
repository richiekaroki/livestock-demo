// src/contexts/AuthContext.tsx — mobile auth context using SecureStore + AsyncStorage
import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AuthResponse, User } from "@wam-mfugo/shared";
import { AUTH_TOKEN_KEY, AUTH_USER_KEY, AUTH_REFRESH_KEY, API_BASE_URL, secureStorage } from "../services/storage";
import { disconnectSocket } from "../services/socket";
import { logger } from "../utils/logger";

type SafeUser = Omit<User, "failedOtpAttempts" | "lockedUntil">;

interface AuthContextType {
  user: SafeUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  requestOtp: (email: string) => Promise<{ message: string; otp?: string }>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  register: (data: {
    email: string;
    name: string;
    phone: string;
    county: string;
    subCounty?: string;
  }) => Promise<{ message: string; otp?: string }>;
  verifyRegistration: (email: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: {
    name?: string;
    phone?: string;
    county?: string;
    subCounty?: string;
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

async function persistAuth(auth: AuthResponse) {
  await Promise.all([
    secureStorage.setItem(AUTH_TOKEN_KEY, auth.accessToken),
    AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(auth.user)),
    secureStorage.setItem(AUTH_REFRESH_KEY, auth.refreshToken),
  ]);
}

async function clearStoredAuth() {
  await Promise.all([
    secureStorage.deleteItem(AUTH_TOKEN_KEY),
    AsyncStorage.removeItem(AUTH_USER_KEY),
    secureStorage.deleteItem(AUTH_REFRESH_KEY),
  ]);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [token, userRaw] = await Promise.all([
          secureStorage.getItem(AUTH_TOKEN_KEY),
          AsyncStorage.getItem(AUTH_USER_KEY),
        ]);
        if (token && userRaw) {
          // Validate token with server
          try {
            const res = await fetch(`${API_BASE_URL}/auth/me`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
              const data = await res.json();
              if (data?.data) {
                setAccessToken(token);
                setUser(data.data);
              } else {
                // Token valid but user data missing — use cached
                setAccessToken(token);
                setUser(JSON.parse(userRaw));
              }
            } else {
              // Token expired — try refresh
              const refreshToken = await secureStorage.getItem(AUTH_REFRESH_KEY);
              if (refreshToken) {
                const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ refreshToken }),
                });
                if (refreshRes.ok) {
                  const refreshData = await refreshRes.json();
                  await secureStorage.setItem(AUTH_TOKEN_KEY, refreshData.data.accessToken);
                  if (refreshData.data.refreshToken) {
                    await secureStorage.setItem(AUTH_REFRESH_KEY, refreshData.data.refreshToken);
                  }
                  setAccessToken(refreshData.data.accessToken);
                  setUser(refreshData.data.user);
                } else {
                  // Refresh failed — clear stored auth
                  await clearStoredAuth();
                }
              } else {
                await clearStoredAuth();
              }
            }
          } catch {
            // Network error — use cached data optimistically
            setAccessToken(token);
            setUser(JSON.parse(userRaw));
          }
        }
      } catch (e) {
        logger.warn("Failed to restore auth session:", e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const requestOtp = useCallback(async (email: string) => {
    const res = await fetch(`${API_BASE_URL}/auth/request-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.error || "Failed to send OTP");
    return data.data;
  }, []);

  const verifyOtp = useCallback(async (email: string, otp: string) => {
    const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.error || "Invalid OTP");
    persistAuth(data.data);
    setUser(data.data.user);
    setAccessToken(data.data.accessToken);
  }, []);

  const register = useCallback(async (regData: {
    email: string;
    name: string;
    phone: string;
    county: string;
    subCounty?: string;
  }) => {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(regData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.error || "Registration failed");
    return data.data;
  }, []);

  const verifyRegistration = useCallback(async (email: string, otp: string) => {
    const res = await fetch(`${API_BASE_URL}/auth/verify-registration`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.error || "Verification failed");
    persistAuth(data.data);
    setUser(data.data.user);
    setAccessToken(data.data.accessToken);
  }, []);

  const logout = useCallback(async () => {
    disconnectSocket();
    if (accessToken) {
      fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }).catch(() => {});
    }
    await clearStoredAuth();
    setUser(null);
    setAccessToken(null);
  }, [accessToken]);

  const updateProfile = useCallback(async (profileData: {
    name?: string;
    phone?: string;
    county?: string;
    subCounty?: string;
  }) => {
    if (!accessToken) throw new Error("Not authenticated");
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(profileData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data.error || "Update failed");
    setUser(data.data);
    await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.data));
  }, [accessToken]);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated: !!user && !!accessToken,
        isLoading,
        requestOtp,
        verifyOtp,
        register,
        verifyRegistration,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
