import { apiClient } from './apiClient';
import type {
  PublicCourse,
  FullCourse,
  SuccessStory,
  NGOPublicProfile,
  NGOPublicCourse,
  FeaturedNGO,
  StudentApplication,
} from '../types/public';
import type { CourseFilters, Pagination } from '../types/ngo';

/**
 * Public API Service - All public-facing API calls for the landing page
 * and related public pages (course details, NGO profiles, stories, etc.)
 */

const PUBLIC = '/public';
const STUDENT = '/student';

export const publicApi = {
  // ─── Courses ───────────────────────────────────────────────────────
  async getCourses(params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    state?: string;
    mode?: string;
  }): Promise<{ courses: PublicCourse[]; pagination: Pagination }> {
    const { data } = await apiClient.get(`${PUBLIC}/courses`, { params });
    return data;
  },

  async getCourseBySlug(slug: string): Promise<{ course: FullCourse }> {
    const { data } = await apiClient.get(`${PUBLIC}/courses/${slug}`);
    return data;
  },

  async getCourseFilters(): Promise<CourseFilters> {
    const { data } = await apiClient.get(`${PUBLIC}/courses/filters`);
    return data;
  },

  // ─── Success Stories ──────────────────────────────────────────────
  async getFeaturedStories(): Promise<{ stories: SuccessStory[] }> {
    const { data } = await apiClient.get(`${PUBLIC}/stories/featured`);
    return data;
  },

  async getAllStories(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ stories: SuccessStory[]; pagination: Pagination }> {
    const { data } = await apiClient.get(`${PUBLIC}/stories`, { params });
    return data;
  },

  // ─── Newsletter ────────────────────────────────────────────────────
  async subscribeNewsletter(email: string): Promise<{ message: string }> {
    const { data } = await apiClient.post(`${PUBLIC}/newsletter/subscribe`, { email });
    return data;
  },

  async unsubscribeNewsletter(email: string): Promise<{ message: string }> {
    const { data } = await apiClient.post(`${PUBLIC}/newsletter/unsubscribe`, { email });
    return data;
  },

  // ─── NGO Public Profile ────────────────────────────────────────────
  async getNGOProfile(slug: string): Promise<{ profile: NGOPublicProfile; courses: NGOPublicCourse[] }> {
    const { data } = await apiClient.get(`${PUBLIC}/ngos/${slug}`);
    return data;
  },

  async getFeaturedNGOs(): Promise<{ ngos: FeaturedNGO[] }> {
    const { data } = await apiClient.get(`${PUBLIC}/ngos/featured`);
    return data;
  },

  // ─── Contact ───────────────────────────────────────────────────────
  async submitContact(payload: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }): Promise<{ message: string }> {
    const { data } = await apiClient.post(`${PUBLIC}/contact`, payload);
    return data;
  },

  // ─── Student Course Actions ────────────────────────────────────────
  async applyToCourse(courseId: string, payload: {
    message?: string;
    documents?: string[];
    resume?: string;
  }): Promise<{ application: StudentApplication; message: string }> {
    const { data } = await apiClient.post(`${STUDENT}/courses/${courseId}/apply`, payload);
    return data;
  },

  async getApplicationStatus(courseId: string): Promise<{ application: StudentApplication | null }> {
    const { data } = await apiClient.get(`${STUDENT}/courses/${courseId}/application`);
    return data;
  },
};
