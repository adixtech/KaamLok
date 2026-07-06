import { apiClient } from './apiClient';
import type {
  AuthResult,
  AuthUser,
  LoginPayload,
  NGORegisterPayload,
  StudentRegisterPayload,
} from '../types/auth';

/**
 * Auth service — the single source of truth for authentication API calls.
 *
 * Every method returns a normalized `AuthUser` (or throws an `ApiError`).
 * The AuthContext wraps this service; pages only talk to the context.
 *
 * To migrate to AWS Cognito later, replace the bodies of these methods
 * with Cognito SDK calls (cognitoUserPool, cognitoIdentityServiceProvider,
 * or Amplify Auth). The method signatures and return types stay the same,
 * so no page or context code needs to change.
 */

const AUTH_BASE = '/auth';

export const authService = {
  async registerStudent(payload: StudentRegisterPayload): Promise<{ message: string; email: string }> {
    const { data } = await apiClient.post(`${AUTH_BASE}/register/student`, payload);
    return data;
  },

  async registerNGO(payload: NGORegisterPayload): Promise<{ message: string; email: string }> {
    const { data } = await apiClient.post(`${AUTH_BASE}/register/ngo`, payload);
    return data;
  },

  async verifyOTP(email: string, otp: string): Promise<AuthResult> {
    const { data } = await apiClient.post(`${AUTH_BASE}/verify-otp`, { email, otp });
    return data;
  },

  async resendOTP(email: string): Promise<{ message: string }> {
    const { data } = await apiClient.post(`${AUTH_BASE}/resend-otp`, { email });
    return data;
  },

  async login(payload: LoginPayload): Promise<AuthResult> {
    const { data } = await apiClient.post(`${AUTH_BASE}/login`, payload);
    return data;
  },

  async logout(): Promise<void> {
    await apiClient.post(`${AUTH_BASE}/logout`);
  },

  async getMe(): Promise<AuthUser | null> {
    try {
      const { data } = await apiClient.get(`${AUTH_BASE}/me`);
      return data.user;
    } catch {
      return null;
    }
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const { data } = await apiClient.post(`${AUTH_BASE}/forgot-password`, { email });
    return data;
  },

  async verifyResetOTP(email: string, otp: string): Promise<{ message: string; token: string }> {
    const { data } = await apiClient.post(`${AUTH_BASE}/verify-reset-otp`, { email, otp });
    return data;
  },

  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    const { data } = await apiClient.post(`${AUTH_BASE}/reset-password`, { token, password });
    return data;
  },
};
