import { apiClient } from './apiClient';
import type {
  AdminUser,
  CreateAdminPayload,
  UpdateAdminPayload,
  Pagination,
  DashboardStats,
  NGOListItem,
  StudentListItem,
  CourseItem,
  ApplicationItem,
  AuditLogItem,
  NotificationItem,
  AnalyticsData,
} from '../types/admin';

/**
 * Admin API service — the single source of truth for admin CRUD/management API calls.
 * Authentication (login, session restore, logout) is handled by authService via
 * the unified /api/auth/* endpoints — NOT by this service.
 */

const BASE = '/admin';

export const adminApi = {
  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    const { data } = await apiClient.get(`${BASE}/dashboard/stats`);
    return data;
  },

  async getAnalytics(period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly'): Promise<AnalyticsData> {
    const { data } = await apiClient.get(`${BASE}/analytics`, { params: { period } });
    return data;
  },

  // Admin management
  async listAdmins(page = 1, limit = 20, search = ''): Promise<{ admins: AdminUser[]; pagination: Pagination }> {
    const { data } = await apiClient.get(`${BASE}/admins`, { params: { page, limit, search } });
    return data;
  },

  async getAdmin(id: string): Promise<AdminUser> {
    const { data } = await apiClient.get(`${BASE}/admins/${id}`);
    return data.admin;
  },

  async createAdmin(payload: CreateAdminPayload): Promise<{ admin: AdminUser; message: string }> {
    const { data } = await apiClient.post(`${BASE}/admins`, payload);
    return data;
  },

  async updateAdmin(id: string, payload: UpdateAdminPayload): Promise<{ admin: AdminUser; message: string }> {
    const { data } = await apiClient.put(`${BASE}/admins/${id}`, payload);
    return data;
  },

  async suspendAdmin(id: string, reason: string): Promise<{ message: string }> {
    const { data } = await apiClient.post(`${BASE}/admins/${id}/suspend`, { reason });
    return data;
  },

  async reactivateAdmin(id: string): Promise<{ message: string }> {
    const { data } = await apiClient.post(`${BASE}/admins/${id}/reactivate`);
    return data;
  },

  async deleteAdmin(id: string, reason: string): Promise<{ message: string }> {
    const { data } = await apiClient.delete(`${BASE}/admins/${id}`, { data: { reason } });
    return data;
  },

  async resetAdminPassword(id: string, password: string): Promise<{ message: string }> {
    const { data } = await apiClient.post(`${BASE}/admins/${id}/reset-password`, { password });
    return data;
  },

  async getLoginHistory(id: string): Promise<{ history: { timestamp: string; ip: string; device: string }[] }> {
    const { data } = await apiClient.get(`${BASE}/admins/${id}/login-history`);
    return data;
  },

  // NGO management
  async listNGOs(params: { page?: number; limit?: number; search?: string; status?: string; verificationStatus?: string }): Promise<{ ngos: NGOListItem[]; pagination: Pagination }> {
    const { data } = await apiClient.get(`${BASE}/ngos`, { params });
    return data;
  },

  async getNGO(id: string): Promise<{ ngo: NGOListItem }> {
    const { data } = await apiClient.get(`${BASE}/ngos/${id}`);
    return data;
  },

  async approveNGO(id: string): Promise<{ message: string }> {
    const { data } = await apiClient.post(`${BASE}/ngos/${id}/approve`);
    return data;
  },

  async rejectNGO(id: string, reason: string): Promise<{ message: string }> {
    const { data } = await apiClient.post(`${BASE}/ngos/${id}/reject`, { reason });
    return data;
  },

  async suspendNGO(id: string, reason: string): Promise<{ message: string }> {
    const { data } = await apiClient.post(`${BASE}/ngos/${id}/suspend`, { reason });
    return data;
  },

  async reactivateNGO(id: string): Promise<{ message: string }> {
    const { data } = await apiClient.post(`${BASE}/ngos/${id}/reactivate`);
    return data;
  },

  async deleteNGO(id: string, reason: string): Promise<{ message: string }> {
    const { data } = await apiClient.delete(`${BASE}/ngos/${id}`, { data: { reason } });
    return data;
  },

  async requestNGODocs(id: string, message: string): Promise<{ message: string }> {
    const { data } = await apiClient.post(`${BASE}/ngos/${id}/request-docs`, { message });
    return data;
  },

  // Student management
  async listStudents(params: { page?: number; limit?: number; search?: string; status?: string; state?: string; city?: string }): Promise<{ students: StudentListItem[]; pagination: Pagination }> {
    const { data } = await apiClient.get(`${BASE}/students`, { params });
    return data;
  },

  async getStudent(id: string): Promise<{ student: StudentListItem }> {
    const { data } = await apiClient.get(`${BASE}/students/${id}`);
    return data;
  },

  async blockStudent(id: string, reason: string): Promise<{ message: string }> {
    const { data } = await apiClient.post(`${BASE}/students/${id}/block`, { reason });
    return data;
  },

  async reactivateStudent(id: string): Promise<{ message: string }> {
    const { data } = await apiClient.post(`${BASE}/students/${id}/reactivate`);
    return data;
  },

  async deleteStudent(id: string, reason: string): Promise<{ message: string }> {
    const { data } = await apiClient.delete(`${BASE}/students/${id}`, { data: { reason } });
    return data;
  },

  // Courses
  async listCourses(params: { page?: number; limit?: number; search?: string; status?: string; category?: string }): Promise<{ courses: CourseItem[]; pagination: Pagination }> {
    const { data } = await apiClient.get(`${BASE}/courses`, { params });
    return data;
  },

  async createCourse(payload: Record<string, unknown>): Promise<{ course: CourseItem; message: string }> {
    const { data } = await apiClient.post(`${BASE}/courses`, payload);
    return data;
  },

  async updateCourse(id: string, payload: Record<string, unknown>): Promise<{ course: CourseItem; message: string }> {
    const { data } = await apiClient.put(`${BASE}/courses/${id}`, payload);
    return data;
  },

  async deleteCourse(id: string): Promise<{ message: string }> {
    const { data } = await apiClient.delete(`${BASE}/courses/${id}`);
    return data;
  },

  // Applications
  async listApplications(params: { page?: number; limit?: number; status?: string }): Promise<{ applications: ApplicationItem[]; pagination: Pagination }> {
    const { data } = await apiClient.get(`${BASE}/applications`, { params });
    return data;
  },

  async updateApplicationStatus(id: string, status: string, notes?: string): Promise<{ message: string }> {
    const { data } = await apiClient.put(`${BASE}/applications/${id}/status`, { status, notes });
    return data;
  },

  // Audit logs
  async getAuditLogs(params: { page?: number; limit?: number; action?: string; adminId?: string }): Promise<{ logs: AuditLogItem[]; pagination: Pagination }> {
    const { data } = await apiClient.get(`${BASE}/audit-logs`, { params });
    return data;
  },

  // Notifications
  async getNotifications(params: { page?: number; limit?: number; unread?: boolean }): Promise<{ notifications: NotificationItem[]; pagination: Pagination; unreadCount: number }> {
    const { data } = await apiClient.get(`${BASE}/notifications`, { params });
    return data;
  },

  async markNotificationRead(id: string): Promise<{ message: string }> {
    const { data } = await apiClient.put(`${BASE}/notifications/${id}/read`);
    return data;
  },

  async markAllNotificationsRead(): Promise<{ message: string }> {
    const { data } = await apiClient.put(`${BASE}/notifications/read-all`);
    return data;
  },

  async deleteNotification(id: string): Promise<{ message: string }> {
    const { data } = await apiClient.delete(`${BASE}/notifications/${id}`);
    return data;
  },

  // Settings
  async getSettings(): Promise<{ settings: Record<string, unknown> }> {
    const { data } = await apiClient.get(`${BASE}/settings`);
    return data;
  },

  async updateSetting(key: string, value: Record<string, unknown>): Promise<{ message: string }> {
    const { data } = await apiClient.put(`${BASE}/settings`, { key, value });
    return data;
  },
};
