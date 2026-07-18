import { apiClient } from './apiClient';
import type {
  StudentDashboardStats,
  StudentProfileResponse,
  ApplicationWithCourse,
  SavedCourseItem,
  DirectoryNGO,
  StudentNotification,
} from '../types/student';
import type { Pagination } from '../types/ngo';
import type { StudentApplication } from '../types/public';

const S = '/student';

export const studentApi = {
  // ─── Dashboard ──────────────────────────────────────────────
  async getDashboardStats(): Promise<{
    stats: StudentDashboardStats;
    recentActivity: ApplicationWithCourse[];
    upcomingInterviews: ApplicationWithCourse[];
    upcomingDeadlines: { applicationId: string; course: unknown; daysLeft: number }[];
  }> {
    const { data } = await apiClient.get(`${S}/dashboard`);
    return data;
  },

  // ─── Profile ────────────────────────────────────────────────
  async getProfile(): Promise<StudentProfileResponse> {
    const { data } = await apiClient.get(`${S}/profile`);
    return data;
  },

  async updateProfile(payload: Partial<{
    firstName: string;
    lastName: string;
    phone: string;
    education: string;
    city: string;
    state: string;
    skills: string[];
    dateOfBirth: string;
    gender: string;
    alternativePhone: string;
    address: string;
    pin: string;
    photo: string;
    bio: string;
    educationDetails: unknown[];
    experience: unknown[];
    languages: string[];
    emergencyContact: unknown;
    resume: string;
    portfolio: string;
    socialLinks: unknown;
  }>): Promise<{ message: string; profileCompletionScore: number }> {
    const { data } = await apiClient.patch(`${S}/profile`, payload);
    return data;
  },

  // ─── Applications ────────────────────────────────────────────
  async getMyApplications(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<{ applications: ApplicationWithCourse[]; pagination: Pagination }> {
    const { data } = await apiClient.get(`${S}/applications`, { params });
    return data;
  },

  async applyToCourse(
    courseId: string,
    payload: { message?: string; documents?: string[]; resume?: string }
  ): Promise<{ application: StudentApplication; message: string }> {
    const { data } = await apiClient.post(`${S}/courses/${courseId}/apply`, payload);
    return data;
  },

  async getApplicationStatus(courseId: string): Promise<{ application: StudentApplication | null }> {
    const { data } = await apiClient.get(`${S}/courses/${courseId}/application`);
    return data;
  },

  async withdrawApplication(applicationId: string): Promise<{ message: string }> {
    const { data } = await apiClient.patch(`${S}/applications/${applicationId}/withdraw`);
    return data;
  },

  // ─── Saved Courses ───────────────────────────────────────────
  async getSavedCourses(params?: {
    page?: number;
    limit?: number;
  }): Promise<{ courses: SavedCourseItem[]; pagination: Pagination }> {
    const { data } = await apiClient.get(`${S}/saved-courses`, { params });
    return data;
  },

  async saveCourse(courseId: string): Promise<{ message: string }> {
    const { data } = await apiClient.post(`${S}/saved-courses/${courseId}`);
    return data;
  },

  async unsaveCourse(courseId: string): Promise<{ message: string }> {
    const { data } = await apiClient.delete(`${S}/saved-courses/${courseId}`);
    return data;
  },

  // ─── NGO Directory ───────────────────────────────────────────
  async getNGODirectory(params?: {
    page?: number;
    limit?: number;
    search?: string;
    state?: string;
  }): Promise<{ ngos: DirectoryNGO[]; pagination: Pagination }> {
    const { data } = await apiClient.get(`${S}/ngos`, { params });
    return data;
  },

  // ─── Notifications ───────────────────────────────────────────
  async getNotifications(params?: {
    page?: number;
    limit?: number;
  }): Promise<{ notifications: StudentNotification[]; pagination: Pagination; unreadCount: number }> {
    const { data } = await apiClient.get(`${S}/notifications`, { params });
    return data;
  },

  async markNotificationRead(id: string): Promise<{ message: string }> {
    const { data } = await apiClient.patch(`${S}/notifications/${id}/read`);
    return data;
  },

  async markAllNotificationsRead(): Promise<{ message: string }> {
    const { data } = await apiClient.patch(`${S}/notifications/mark-all-read`);
    return data;
  },
};
