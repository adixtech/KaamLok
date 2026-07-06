/**
 * Shared auth types.
 * These mirror the backend User/StudentProfile/NGOProfile models and are
 * used by the auth context, API services, and pages.
 *
 * The shape is intentionally provider-agnostic so a future AWS Cognito
 * migration only requires swapping the service implementation, not the
 * context or pages.
 */

export type Role = 'student' | 'ngo' | 'admin';

export type UserStatus = 'active' | 'pending' | 'blocked';

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: Role;
  status: UserStatus;
  emailVerified: boolean;
  isEmailVerified: boolean; // kept for backward compat with existing pages
  isActive: boolean;
  isBlocked: boolean;
  profileCompleted: boolean;
  lastLogin: string | null;
  createdAt: string;
  // Optional profile fields
  education?: string;
  city?: string;
  state?: string;
  ngoName?: string;
  registrationNumber?: string;
  website?: string;
  description?: string;
  verificationStatus?: 'pending' | 'approved' | 'rejected';
}

export interface LoginPayload {
  email: string;
  password: string;
  remember?: boolean;
}

export interface StudentRegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  education: string;
  city: string;
  state: string;
}

export interface NGORegisterPayload {
  ngoName: string;
  registrationNumber: string;
  email: string;
  phone: string;
  website?: string;
  state: string;
  city: string;
  description: string;
  password: string;
}

export interface AuthResult {
  user: AuthUser;
  token: string;
}

export interface ApiError {
  message: string;
  code?: string;
  field?: string;
}
