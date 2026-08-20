// src/contexts/AuthContext.tsx — mobile auth context using AsyncStorage
import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AuthResponse, User } from "@wam-mfugo/shared";

const TOKEN_KEY = "wam_auth_token";
const USER_KEY = "wam_auth_user";
const REFRESH_KEY = "wam_auth_refresh";

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000/api";

type SafeUser = Omit<User, "failedOtpAttempts" | "lockedUntil">;

interface AuthContextType {
  user: SafeUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  requestOtp: (email: string) => Promise<{ message: string }>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  register: (data: {
    email: string;
    name: string;
    phone: string;
    county: string;
    subCounty?: string;
  }) => Promise<{ message: string }>;
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

function persistAuth(auth: AuthResponse) {
  AsyncStorage.setItem(TOKEN_KEY, auth.accessToken);
  AsyncStorage.setItem(USER_KEY, JSON.stringify(auth.user));
  AsyncStorage.setItem(REFRESH_KEY, auth.refreshToken);
}

async function clearStoredAuth() {
  await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY, REFRESH_KEY]);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [token, userRaw] = await AsyncStorage.multiGet([TOKEN_KEY, USER_KEY]);
        if (token[1] && userRaw[1]) {
          setAccessToken(token[1]);
          setUser(JSON.parse(userRaw[1]));
        }
      } catch (e) {
        console.warn("Failed to restore auth session:", e);
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
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.data));
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
