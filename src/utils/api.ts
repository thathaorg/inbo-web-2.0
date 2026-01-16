import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://inbo-django-api.azurewebsites.net';
const IS_BROWSER = typeof window !== 'undefined';
const APP_URL = IS_BROWSER ? window.location.origin : '';

// Determine if we should use proxy routes (browser context only)
const useProxy = IS_BROWSER;

// For auth endpoints, use local proxy; for others use backend directly
function getBaseURL(endpoint?: string): string {
  if (!useProxy) return API_BASE_URL;
  
  // Auth endpoints go through proxy
  if (endpoint && (endpoint.includes('/auth/send-otp') || endpoint.includes('/auth/verify-otp') || endpoint.includes('/auth/check-email'))) {
    return APP_URL;
  }
  
  return API_BASE_URL;
}

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds - increased for slow backend responses
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token & use proxy for CORS-sensitive endpoints
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = Cookies.get('access_token');
    
    // Route auth endpoints through proxy to avoid CORS
    if (useProxy && config.url && (config.url.includes('/auth/send-otp') || config.url.includes('/auth/verify-otp') || config.url.includes('/auth/check-email'))) {
      config.baseURL = APP_URL;
      console.debug(`🔀 Using proxy route: ${config.url}`);
    }
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
      console.debug(`🔒 Auth token added to request: ${config.url?.substring(0, 50)}...`);
    } else if (config.url && !config.url.includes('/auth/send-otp') && !config.url.includes('/auth/verify-otp') && !config.url.includes('/auth/check-email')) {
      console.warn(`⚠️ No auth token for: ${config.url}`);
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors and token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = Cookies.get('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/api/auth/refresh/`, {
            refreshToken: refreshToken,
          });

          const { accessToken } = response.data;
          Cookies.set('access_token', accessToken, { expires: 7 });

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }

          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token expired or invalid
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        if (IS_BROWSER) {
          window.location.href = '/auth/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

