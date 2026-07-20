import { apiClient } from './apiClient';
import type {
  Course,
  Application,
  NGOProfile,
  NGODashboardStats,
  NGOAnalytics,
  CourseFilters,
  Pagination,
  ApplicationStatus,
  CourseStatus,
  DocumentType,
  NGONotification,
} from '../types/ngo';

/**
 * NGO API Service - All API calls for NGO dashboard
 */

const BASE = '/ngo';
const PUBLIC_BASE = '/public';

export const ngoApi = {
  // ─── Dashboard ──────────────────────────────────────────────────────
  async getDashboardStats(): Promise<NGODashboardStats> {
    const { data } = await apiClient.get(`${BASE}/dashboard/stats`);
    return data;
  },

  
  // ─── Courses ─────────────────────────────────────────────────────────
  async listCourses(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: CourseStatus;
    category?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ courses: Course[]; pagination: Pagination }> {
    const { data } = await apiClient.get(`${BASE}/courses`, { params });
    return data;
  },

  async getCourse(id: string): Promise<{ course: Course }> {
    const { data } = await apiClient.get(`${BASE}/courses/${id}`);
    return data;
  },

  async createCourse(payload: Record<string, unknown>): Promise<{ course: Course; message: string }> {
    const { data } = await apiClient.post(`${BASE}/courses`, payload);
    return data;
  },

  // async updateCourse(id: string, payload: Record<string, unknown>): Promise<{ course: Course; message: string }> {
  //   const { data } = await apiClient.put(`${BASE}/courses/${id}`, payload);
  //   return data;
  // },

//add for solving the update course part errror
  async updateCourse(id: string, payload: Record<string, unknown>): Promise<{ course: Course; message: string }> {
    // Destructure and strip out system/read-only database fields that cause 400 Bad Request errors
    const { 
      _id, 
      id: temporaryId, // in case 'id' is also passed in payload
      createdAt, 
      updatedAt, 
      __v, 
      viewsCount, 
      filledSeats, 
      applicationsCount, 
      ...cleanPayload 
    } = payload;

    // Send only the clean form data to the backend
    const { data } = await apiClient.put(`${BASE}/courses/${id}`, cleanPayload);
    return data;
  },

  async publishCourse(id: string): Promise<{ course: Course; message: string }> {
    const { data } = await apiClient.post(`${BASE}/courses/${id}/publish`);
    return data;
  },

  async pauseCourse(id: string): Promise<{ message: string }> {
    const { data } = await apiClient.post(`${BASE}/courses/${id}/pause`);
    return data;
  },

  async resumeCourse(id: string): Promise<{ message: string }> {
    const { data } = await apiClient.post(`${BASE}/courses/${id}/resume`);
    return data;
  },

  async closeCourse(id: string): Promise<{ message: string }> {
    const { data } = await apiClient.post(`${BASE}/courses/${id}/close`);
    return data;
  },

  async archiveCourse(id: string): Promise<{ message: string }> {
    const { data } = await apiClient.post(`${BASE}/courses/${id}/archive`);
    return data;
  },

  async duplicateCourse(id: string): Promise<{ course: Course; message: string }> {
    const { data } = await apiClient.post(`${BASE}/courses/${id}/duplicate`);
    return data;
  },

  async deleteCourse(id: string): Promise<{ message: string }> {
    const { data } = await apiClient.delete(`${BASE}/courses/${id}`);
    return data;
  },

  // ─── Applications ────────────────────────────────────────────────────
  async listApplications(params?: {
    page?: number;
    limit?: number;
    status?: ApplicationStatus;
    courseId?: string;
    search?: string;
    sortBy?: string;
  }): Promise<{ applications: Application[]; pagination: Pagination }> {
    const { data } = await apiClient.get(`${BASE}/applications`, { params });
    return data;
  },

  async getApplication(id: string): Promise<{ application: Application }> {
    const { data } = await apiClient.get(`${BASE}/applications/${id}`);
    return data;
  },

  async startReviewApplication(id: string, note?: string): Promise<{ message: string }> {
    const { data } = await apiClient.post(`${BASE}/applications/${id}/review`, { note });
    return data;
  },

  async shortlistApplication(id: string, note?: string): Promise<{ message: string }> {
    const { data } = await apiClient.post(`${BASE}/applications/${id}/shortlist`, { note });
    return data;
  },

  async rejectApplication(id: string, reason: string): Promise<{ message: string }> {
    const { data } = await apiClient.post(`${BASE}/applications/${id}/reject`, { reason });
    return data;
  },

  async selectApplication(id: string, note?: string): Promise<{ message: string }> {
    const { data } = await apiClient.post(`${BASE}/applications/${id}/select`, { note });
    return data;
  },

  async waitlistApplication(id: string, note?: string): Promise<{ message: string }> {
    const { data } = await apiClient.post(`${BASE}/applications/${id}/waitlist`, { note });
    return data;
  },

  // ─── Interviews ──────────────────────────────────────────────────────
  async getInterviews(params?: {
    page?: number;
    limit?: number;
    status?: 'upcoming' | 'completed' | 'all';
    courseId?: string;
  }): Promise<{ interviews: Application[]; pagination: Pagination }> {
    const { data } = await apiClient.get(`${BASE}/interviews`, { params });
    return data;
  },

  async scheduleInterview(id: string, payload: {
    scheduledAt: string;
    mode: 'online' | 'offline' | 'phone';
    location?: string;
    meetingLink?: string;
    notes?: string;
  }): Promise<{ message: string }> {
    const { data } = await apiClient.post(`${BASE}/interviews/${id}/schedule`, payload);
    return data;
  },

  async completeInterview(id: string, payload: {
    feedback?: string;
    outcome: 'selected' | 'rejected';
  }): Promise<{ message: string }> {
    const { data } = await apiClient.post(`${BASE}/interviews/${id}/complete`, payload);
    return data;
  },

  // ─── Profile ──────────────────────────────────────────────────────────
  async getProfile(): Promise<{ profile: NGOProfile }> {
    const { data } = await apiClient.get(`${BASE}/profile`);
    return data;
  },

  async updateProfile(payload: Record<string, unknown>): Promise<{ profile: NGOProfile; message: string }> {
    const { data } = await apiClient.put(`${BASE}/profile`, payload);
    return data;
  },

  async uploadDocument(payload: {
    type: DocumentType;
    name: string;
    url: string;
  }): Promise<{ message: string }> {
    const { data } = await apiClient.post(`${BASE}/documents`, payload);
    return data;
  },

  async deleteDocument(id: string): Promise<{ message: string }> {
    const { data } = await apiClient.delete(`${BASE}/documents/${id}`);
    return data;
  },

  // ─── Analytics ────────────────────────────────────────────────────────
  async getAnalytics(period?: string): Promise<NGOAnalytics> {
    const { data } = await apiClient.get(`${BASE}/analytics`, { params: { period } });
    return data;
  },

    // ─── Notifications ──────────────────────────────────────────────────
  async getNotifications(params?: {
    page?: number;
    limit?: number;
  }): Promise<{
    notifications: NGONotification[];
    pagination: Pagination;
    unreadCount: number;
  }> {
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
  // ─── Public Routes ─────────────────────────────────────────────────────
  async getPublicCourses(params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    state?: string;
    mode?: string;
  }): Promise<{ courses: Course[]; pagination: Pagination }> {
    const { data } = await apiClient.get(`${PUBLIC_BASE}/courses`, { params });
    return data;
  },

  async getPublicCourseBySlug(slug: string): Promise<{ course: Course }> {
    const { data } = await apiClient.get(`${PUBLIC_BASE}/courses/${slug}`);
    return data;
  },

  async getCourseFilters(): Promise<CourseFilters> {
    const { data } = await apiClient.get(`${PUBLIC_BASE}/courses/filters`);
    return data;
  },
};
