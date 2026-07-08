/**
 * Admin-specific types.
 * These mirror the backend Admin model and admin API responses.
 */

export type AdminRole =
  | 'super_admin'
  | 'operations_admin'
  | 'verification_admin'
  | 'support_admin'
  | 'analytics_admin'
  | 'content_admin'
  | 'csr_admin';

export type Permission =
  | 'admin:create' | 'admin:read' | 'admin:update' | 'admin:delete' | 'admin:reset_password'
  | 'ngo:approve' | 'ngo:reject' | 'ngo:suspend' | 'ngo:delete'
  | 'student:block' | 'student:delete'
  | 'course:create' | 'course:update' | 'course:delete'
  | 'application:read' | 'application:update'
  | 'report:read' | 'report:export'
  | 'settings:update' | 'audit:read' | 'notification:manage';

export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  adminRole: AdminRole;
  permissions: Permission[];
  isActive: boolean;
  isSuspended: boolean;
  lastLogin: string | null;
  createdAt: string;
}

export interface AdminLoginPayload {
  email: string;
  password: string;
}

export interface CreateAdminPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  adminRole: AdminRole;
}

export interface UpdateAdminPayload {
  firstName?: string;
  lastName?: string;
  adminRole?: AdminRole;
  permissions?: Permission[];
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface DashboardStats {
  students: { total: number; verified: number; pending: number; blocked: number };
  ngos: { total: number; pending: number; approved: number; rejected: number; blocked: number };
  courses: { total: number; published: number };
  applications: { active: number };
  admins: { total: number; active: number };
  companies: { total: number };
  csr: { activeProjects: number };
  logins: { daily: number; weekly: number; monthly: number };
  recentActivities: {
    adminName: string;
    action: string;
    targetType: string;
    targetName: string;
    timestamp: string;
  }[];
  recentNotifications: {
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
  }[];
  systemHealth: {
    server: string;
    database: string;
    storage: { used: number; total: number; unit: string };
  };
}

export interface NGOListItem {
  id: string;
  ngoName: string;
  email: string;
  phone: string;
  registrationNumber: string;
  website: string;
  description: string;
  status: string;
  verificationStatus: string;
  emailVerified: boolean;
  createdAt: string;
  lastLogin: string | null;
}

export interface StudentListItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: string;
  emailVerified: boolean;
  education: string;
  city: string;
  state: string;
  skills: string[];
  createdAt: string;
  lastLogin: string | null;
}

export interface CourseItem {
  _id: string;
  title: string;
  description: string;
  category: string;
  skills: string[];
  duration: string;
  mode: string;
  seats: number;
  enrolledCount: number;
  isFeatured: boolean;
  status: string;
  createdAt: string;
}

export interface ApplicationItem {
  _id: string;
  status: string;
  notes: string;
  studentId: { firstName: string; lastName: string; email: string } | string;
  courseId: { title: string } | string;
  createdAt: string;
}

export interface AuditLogItem {
  _id: string;
  adminName: string;
  adminEmail: string;
  action: string;
  targetType: string;
  targetName: string;
  reason: string;
  ip: string;
  timestamp: string;
}

export interface NotificationItem {
  _id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  link: string;
  createdAt: string;
}

export interface AnalyticsData {
  period: string;
  userGrowth: { _id: Record<string, number>; count: number }[];
  ngoGrowth: { _id: Record<string, number>; count: number }[];
  applicationGrowth: { _id: Record<string, number>; count: number }[];
  coursePopularity: { _id: string; count: number }[];
  stateWise: { _id: string; count: number }[];
  totals: { students: number };
}

export const ADMIN_ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: 'Super Admin',
  operations_admin: 'Operations Admin',
  verification_admin: 'Verification Admin',
  support_admin: 'Support Admin',
  analytics_admin: 'Analytics Admin',
  content_admin: 'Content Admin',
  csr_admin: 'CSR Admin',
};
