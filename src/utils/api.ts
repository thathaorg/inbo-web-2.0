import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://inbo-django-api.azurewebsites.net';
const IS_BROWSER = typeof window !== 'undefined';
const APP_URL = IS_BROWSER ? window.location.origin : '';

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
        data: originalRequest.data,
        responseData: error.response?.data,
      });
    }

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

