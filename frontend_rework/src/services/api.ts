import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// ─── Base URL ─────────────────────────────────────────────────────────────────
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1';

// ─── Axios Instance ───────────────────────────────────────────────────────────
export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ─── Request Interceptor (attach token) ──────────────────────────────────────
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Token will be injected by auth store interceptor registration
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// ─── Response Interceptor (normalize errors) ─────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message: string }>) => {
    if (error.response?.status === 401) {
      // Token refresh or logout handled by auth store
      console.warn('[API] 401 Unauthorized — token may be expired.');
    }
    return Promise.reject(error);
  },
);

export default apiClient;
