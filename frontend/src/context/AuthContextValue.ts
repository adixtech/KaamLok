import { createContext } from 'react';
import type { AuthUser, LoginPayload, NGORegisterPayload, StudentRegisterPayload, Role } from '../types/auth';

export type AuthContextValue = {
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

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);