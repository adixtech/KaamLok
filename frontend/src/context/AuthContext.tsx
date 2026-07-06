import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { authService } from '../services/authService';
import type { AuthUser, LoginPayload, NGORegisterPayload, StudentRegisterPayload, Role } from '../types/auth';

type ApiError = { message: string; code?: string; field?: string; status?: number };

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  role: Role | null;
  isStudent: boolean;
  isNGO: boolean;
  isAdmin: boolean;
  login: (payload: LoginPayload) => Promise<AuthUser>;
  registerStudent: (payload: StudentRegisterPayload) => Promise<{ message: string; email: string }>;
  registerNGO: (payload: NGORegisterPayload) => Promise<{ message: string; email: string }>;
  verifyOTP: (email: string, otp: string) => Promise<AuthUser>;
  resendOTP: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * AuthProvider wraps the app and exposes a stable authentication API.
 *
 * On mount it calls `initialize()` to restore the session from the
 * HttpOnly JWT cookie (auto-login). All mutations go through `authService`,
 * so swapping the backend (e.g. to AWS Cognito) only requires replacing
 * the service — this provider and every page stay unchanged.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Restore the session from the HttpOnly cookie on mount (auto-login).
   * Extracted as a reusable function so it can be called again if needed
   * (e.g. after a token refresh attempt fails and the user re-authenticates).
   */
  const initialize = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const u = await authService.getMe();
      setUser(u);
    } catch (err) {
      setUser(null);
      const e = err as ApiError;
      if (e?.status && e.status !== 401) {
        setError(e.message || 'Session restore failed');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      await initialize();
      if (!active) return;
    })();
    return () => {
      active = false;
    };
  }, [initialize]);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const u = await authService.getMe();
      setUser(u);
    } catch (err) {
      setUser(null);
      const e = err as ApiError;
      if (e?.status && e.status !== 401) {
        setError(e.message || 'Session expired');
      }
    }
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    setError(null);
    try {
      const { user: u } = await authService.login(payload);
      setUser(u);
      return u;
    } catch (err) {
      const e = err as ApiError;
      setError(e.message || 'Login failed');
      throw err;
    }
  }, []);

  const registerStudent = useCallback(async (payload: StudentRegisterPayload) => {
    setError(null);
    try {
      return await authService.registerStudent(payload);
    } catch (err) {
      const e = err as ApiError;
      setError(e.message || 'Registration failed');
      throw err;
    }
  }, []);

  const registerNGO = useCallback(async (payload: NGORegisterPayload) => {
    setError(null);
    try {
      return await authService.registerNGO(payload);
    } catch (err) {
      const e = err as ApiError;
      setError(e.message || 'Registration failed');
      throw err;
    }
  }, []);

  const verifyOTP = useCallback(async (email: string, otp: string) => {
    setError(null);
    try {
      const { user: u } = await authService.verifyOTP(email, otp);
      setUser(u);
      return u;
    } catch (err) {
      const e = err as ApiError;
      setError(e.message || 'OTP verification failed');
      throw err;
    }
  }, []);

  const resendOTP = useCallback(async (email: string) => {
    setError(null);
    try {
      await authService.resendOTP(email);
    } catch (err) {
      const e = err as ApiError;
      setError(e.message || 'Failed to resend OTP');
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    setError(null);
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      error,
      isAuthenticated: !!user,
      role: user?.role ?? null,
      isStudent: user?.role === 'student',
      isNGO: user?.role === 'ngo',
      isAdmin: user?.role === 'admin',
      login,
      registerStudent,
      registerNGO,
      verifyOTP,
      resendOTP,
      logout,
      refresh,
      clearError,
    }),
    [user, loading, error, login, registerStudent, registerNGO, verifyOTP, resendOTP, logout, refresh, clearError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Access the auth context. Throws if used outside AuthProvider.
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

export type { ApiError };
