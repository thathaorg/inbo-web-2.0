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

// Mutex for token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });

  failedQueue = [];
};

// Check if URL is an auth endpoint
const isAuthEndpoint = (url: string | undefined): boolean => {
  if (!url) return false;
  return AUTH_ENDPOINTS.some(endpoint => url.includes(endpoint));
};

// Create axios instance - ALL requests go through local proxy to bypass CORS
const apiClient: AxiosInstance = axios.create({
  baseURL: APP_URL || API_BASE_URL, // Use local proxy if in browser
  timeout: 60000, // 60 seconds - increased for slow backend responses
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

    // Log 401 errors with details (but not for every retry)
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.warn('⚠️ Authentication required:', {
        url: originalRequest.url?.substring(0, 80),
        hasToken: !!Cookies.get('access_token'),
        hasRefreshToken: !!Cookies.get('refresh_token'),
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
      if (isRefreshing) {
        try {
          const token = await new Promise<string>((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return apiClient(originalRequest);
        } catch (err) {
          return Promise.reject(err);
        }
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = Cookies.get('refresh_token');
        if (refreshToken) {
          console.log('🔄 Attempting token refresh...');
          const response = await axios.post(`${API_BASE_URL}/api/auth/refresh/`, {
            refreshToken: refreshToken,
          });

          const { accessToken, expiresAt } = response.data;
          
          // Use consistent cookie options
          const isSecure = IS_BROWSER && window.location.protocol === 'https:';
          Cookies.set('access_token', accessToken, { 
            expires: 7, 
            sameSite: 'lax',
            secure: isSecure,
            path: '/',
          });

          if (expiresAt) {
            Cookies.set('token_expires_at', expiresAt, {
              expires: 7,
              sameSite: 'lax',
              secure: isSecure,
              path: '/',
            });
          }
          
          console.log('✅ Token refreshed successfully');

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }

          processQueue(null, accessToken);
          return apiClient(originalRequest);
        } else {
          console.warn('⚠️ No refresh token available');
          processQueue(new Error('No refresh token available'), null);
        }
      } catch (refreshError: any) {
        processQueue(refreshError, null);
        
        // Refresh token expired or invalid - clear tokens and redirect
        console.error('❌ Token refresh failed:', refreshError?.response?.data || refreshError.message);
        Cookies.remove('access_token', { path: '/' });
        Cookies.remove('refresh_token', { path: '/' });
        
        // Clear all cached data
        try {
          localStorage.removeItem('inbo_user_cache');
          localStorage.removeItem('inbo_user_last_fetch');
          localStorage.removeItem('user_cache');
        } catch (e) {
          // Ignore localStorage errors
        }
        
        if (IS_BROWSER && !window.location.pathname.startsWith('/auth')) {
          window.location.href = '/auth/login';
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Proactively refresh token before it expires
 * Call this periodically (e.g., every 5 minutes) to keep session alive
 */
export const proactiveTokenRefresh = async (): Promise<boolean> => {
  // If a refresh is already in progress, don't interfere
  if (isRefreshing) return true;

  const refreshToken = Cookies.get('refresh_token');
  if (!refreshToken) return false;

  // Check if we actually need to refresh
  const expiresAt = Cookies.get('token_expires_at');
  if (expiresAt) {
    const expiryDate = new Date(expiresAt);
    const now = new Date();
    // If more than 5 minutes remaining, skip refresh
    const timeRemaining = expiryDate.getTime() - now.getTime();
    if (timeRemaining > 5 * 60 * 1000) {
      console.log(`⏳ Token still valid (${Math.round(timeRemaining / 1000 / 60)}m), skipping proactive refresh`);
      return true;
    }
  }

  // Use mutex to prevent conflicts
  isRefreshing = true;

  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/refresh/`, {
      refreshToken: refreshToken,
    });

    const { accessToken, expiresAt: newExpiresAt } = response.data;
    const isSecure = IS_BROWSER && window.location.protocol === 'https:';
    
    Cookies.set('access_token', accessToken, { 
      expires: 7, 
      sameSite: 'lax',
      secure: isSecure,
      path: '/',
    });
    
    if (newExpiresAt) {
      Cookies.set('token_expires_at', newExpiresAt, {
        expires: 7,
        sameSite: 'lax',
        secure: isSecure,
        path: '/',
      });
    }
    
    console.log('🔄 Proactive token refresh successful');
    
    // Resolve any queued requests
    processQueue(null, accessToken);
    
    return true;
  } catch (error) {
    console.warn('Proactive token refresh failed:', error);
    return false;
  } finally {
    isRefreshing = false;
  }
};

export default apiClient;

