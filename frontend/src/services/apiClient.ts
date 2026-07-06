import axios, { AxiosError, type AxiosInstance } from 'axios';

/**
 * Centralized API client.
 *
 * - Uses `withCredentials` so the backend can set/read HttpOnly JWT cookies.
 * - In development, the backend runs on port 5000; Vite proxies /api to it.
 * - In production, the same origin serves both, so baseURL is just '/api'.
 *
 * The auth service is the ONLY module that should import this client
 * directly. Pages consume the auth context, which wraps the service —
 * this indirection is what makes a future AWS Cognito migration cheap:
 * swap `authService` for a Cognito-backed implementation and the rest
 * of the frontend stays untouched.
 */
const baseURL = import.meta.env.VITE_API_URL || '/api';

export const apiClient: AxiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach a request interceptor for future request-level tweaks (e.g. CSRF).
apiClient.interceptors.request.use((config) => {
  return config;
});

// Normalize errors so the auth service can surface a consistent shape.
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; code?: string; field?: string }>) => {
    const normalized = {
      message: error.response?.data?.message || error.message || 'Something went wrong. Please try again.',
      code: error.response?.data?.code,
      field: error.response?.data?.field,
      status: error.response?.status,
    };
    return Promise.reject(normalized);
  }
);

export type { AxiosError };
