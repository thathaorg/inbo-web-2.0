import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://inbo-django-api.azurewebsites.net';
const IS_BROWSER = typeof window !== 'undefined';
const APP_URL = IS_BROWSER ? window.location.origin : '';

// Auth endpoints that should NOT trigger token refresh on 401
// These endpoints return 401 for invalid credentials, not expired tokens
const AUTH_ENDPOINTS = [
  '/api/auth/send-otp',
  '/api/auth/verify-otp',
  '/api/auth/check-email',
  '/api/auth/refresh',
  '/api/auth/google',
  '/api/auth/apple',
];

// Check if URL is an auth endpoint
const isAuthEndpoint = (url: string | undefined): boolean => {
  if (!url) return false;
  return AUTH_ENDPOINTS.some(endpoint => url.includes(endpoint));
};

// Create axios instance - ALL requests go through local proxy to bypass CORS
const apiClient: AxiosInstance = axios.create({
  baseURL: APP_URL || API_BASE_URL, // Use local proxy if in browser
  timeout: 30000, // 30 seconds - increased for slow backend responses
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = Cookies.get('access_token');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
      console.debug(`🔒 Auth token added to request: ${config.url?.substring(0, 50)}...`);
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

    // Log 401 errors with details
    if (error.response?.status === 401) {
      console.error('❌ 401 Unauthorized Error:', {
        url: originalRequest.url,
        method: originalRequest.method,
        responseData: error.response?.data,
      });
    }

    // IMPORTANT: Don't try to refresh tokens for auth endpoints
    // Auth endpoints (verify-otp, send-otp, etc.) return 401 for invalid credentials
    // We should NOT redirect to login or try to refresh on these
    if (isAuthEndpoint(originalRequest.url)) {
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized for protected endpoints only
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = Cookies.get('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/api/auth/refresh/`, {
            refreshToken: refreshToken,
          });

          const { accessToken } = response.data;
          Cookies.set('access_token', accessToken, { expires: 7, sameSite: 'strict' });

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }

          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token expired or invalid - clear tokens and redirect
        console.error('🔄 Token refresh failed:', refreshError);
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        localStorage.removeItem('user_cache');
        if (IS_BROWSER && !window.location.pathname.startsWith('/auth')) {
          window.location.href = '/auth/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

