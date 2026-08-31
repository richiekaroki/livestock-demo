import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User, AuthResponse } from '@wam-mfugo/shared';
import { API_BASE, TOKEN_KEY, USER_KEY } from '../config';

interface AuthContextType {
  user: Omit<User, 'failedOtpAttempts' | 'lockedUntil'> | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isOffline: boolean;
  requestOtp: (email: string) => Promise<{ message: string; otp?: string; autoVerified?: boolean }>;
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

function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function getUser(): Omit<User, 'failedOtpAttempts' | 'lockedUntil'> | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveAuth(auth: AuthResponse) {
  localStorage.setItem(TOKEN_KEY, auth.accessToken);
  localStorage.setItem(USER_KEY, JSON.stringify(auth.user));
}

function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Omit<User, 'failedOtpAttempts' | 'lockedUntil'> | null>(getUser);
  const [accessToken, setAccessToken] = useState<string | null>(getToken);
  const [isLoading, setIsLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const requestOtp = useCallback(async (email: string) => {
    const res = await fetch(`${API_BASE}/auth/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to send OTP');
    return data.data;
  }, []);

  const verifyOtp = useCallback(async (email: string, otp: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Invalid OTP');
      saveAuth(data.data);
      setUser(data.data.user);
      setAccessToken(data.data.accessToken);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (regData: {
    email: string;
    name: string;
    phone: string;
    county: string;
    subCounty?: string;
  }) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(regData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');
    return data.data;
  }, []);

  const verifyRegistration = useCallback(async (email: string, otp: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/verify-registration`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Verification failed');
      saveAuth(data.data);
      setUser(data.data.user);
      setAccessToken(data.data.accessToken);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    const token = getToken();
    if (token) {
      try {
        await fetch(`${API_BASE}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
      } catch {
        // API unreachable, session will expire naturally
      }
    }
    clearAuth();
    setUser(null);
    setAccessToken(null);
  }, []);

  const updateProfile = useCallback(async (profileData: {
    name?: string;
    phone?: string;
    county?: string;
    subCounty?: string;
  }) => {
    const token = getToken();
    if (!token) throw new Error('Not authenticated');

    const res = await fetch(`${API_BASE}/auth/me`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Update failed');

    setUser(data.data);
    localStorage.setItem(USER_KEY, JSON.stringify(data.data));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated: !!user && !!accessToken,
        isLoading,
        isOffline,
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

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
