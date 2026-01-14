import apiClient from '@/utils/api';
import Cookies from 'js-cookie';
import type {
  GoogleAuthRequest,
  AppleAuthRequest,
} from '@/types/auth';

const AUTH_ENDPOINTS = {
  SEND_OTP: '/auth/send-otp/',
  VERIFY_OTP: '/auth/verify-otp/',
  LOGOUT: '/auth/logout/',
  REFRESH: '/auth/refresh/',
  CHECK_EMAIL: '/auth/check-email/',
  VALIDATE_SESSION: '/auth/validate-session/',
  USER_PROFILE: '/user/complete-data/',
  GOOGLE_AUTH: '/auth/google',
  APPLE_AUTH: '/auth/apple',
} as const;

// Response types matching Inbo Backend API
export interface SendOTPResponse {
  success: boolean;
  message: string;
}

export interface VerifyOTPResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    isVerified: boolean;
    isInboxCreated: boolean;
  };
  isNewUser: boolean;
}

export interface UserProfileResponse {
  id: string;
  email: string;
  username: string | null;
  name: string | null;
  birthYear: string | null;
  gender: string | null;
  isVerified: boolean;
  isInboxCreated: boolean;
  inboxEmail: string | null;
  createdAt: string;
}

export interface CheckEmailResponse {
  exists: boolean;
}

class AuthService {
  /**
   * Send OTP to email address
   */
  async sendOTP(email: string): Promise<SendOTPResponse> {
    const response = await apiClient.post<SendOTPResponse>(AUTH_ENDPOINTS.SEND_OTP, { email });
    return response.data;
  }

  /**
   * Verify OTP and get JWT tokens
   */
  async verifyOTP(email: string, otp: string, deviceInfo?: object): Promise<VerifyOTPResponse> {
    const response = await apiClient.post<VerifyOTPResponse>(AUTH_ENDPOINTS.VERIFY_OTP, {
      email,
      otp,
      deviceInfo: deviceInfo || {
        deviceName: typeof navigator !== 'undefined' ? navigator.userAgent : 'Web Browser',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        ip: '',
      },
    });
    this.setTokens(response.data.accessToken, response.data.refreshToken);
    return response.data;
  }

  /**
   * Logout user
   */
  async logout(logoutFromAllDevices: boolean = false): Promise<void> {
    try {
      const refreshToken = this.getRefreshToken();
      if (refreshToken) {
        await apiClient.post(AUTH_ENDPOINTS.LOGOUT, { refreshToken, logoutFromAllDevices });
      }
    } finally {
      this.clearTokens();
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<UserProfileResponse> {
    const response = await apiClient.get<UserProfileResponse>(AUTH_ENDPOINTS.USER_PROFILE);
    return response.data;
  }

  /**
   * Check if email is already registered
   */
  async checkEmail(email: string): Promise<CheckEmailResponse> {
    const response = await apiClient.get<CheckEmailResponse>(AUTH_ENDPOINTS.CHECK_EMAIL, {
      params: { email },
    });
    return response.data;
  }

  /**
   * Google OAuth authentication
   */
  async googleAuth(data: GoogleAuthRequest): Promise<VerifyOTPResponse> {
    const response = await apiClient.post<VerifyOTPResponse>(AUTH_ENDPOINTS.GOOGLE_AUTH, data);
    this.setTokens(response.data.accessToken, response.data.refreshToken);
    return response.data;
  }

  /**
   * Apple OAuth authentication
   */
  async appleAuth(data: AppleAuthRequest): Promise<VerifyOTPResponse> {
    const response = await apiClient.post<VerifyOTPResponse>(AUTH_ENDPOINTS.APPLE_AUTH, data);
    this.setTokens(response.data.accessToken, response.data.refreshToken);
    return response.data;
  }

  /**
   * Validate session
   */
  async validateSession(): Promise<{ isValid: boolean; user: UserProfileResponse | null }> {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();
    
    if (!accessToken && !refreshToken) {
      return { isValid: false, user: null };
    }

    const response = await apiClient.post<{ isValid: boolean; user: any; message?: string }>(
      AUTH_ENDPOINTS.VALIDATE_SESSION,
      { accessToken, refreshToken }
    );
    return response.data;
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<{ accessToken: string; expiresAt: string }> {
    const refreshToken = Cookies.get('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiClient.post<{ accessToken: string; expiresAt: string }>(
      AUTH_ENDPOINTS.REFRESH,
      { refreshToken }
    );
    Cookies.set('access_token', response.data.accessToken, { expires: 7, sameSite: 'strict' });
    return response.data;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!Cookies.get('access_token');
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    return Cookies.get('access_token') || null;
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    return Cookies.get('refresh_token') || null;
  }

  /**
   * Set authentication tokens
   */
  private setTokens(accessToken: string, refreshToken: string): void {
    Cookies.set('access_token', accessToken, { expires: 7, sameSite: 'strict' });
    Cookies.set('refresh_token', refreshToken, { expires: 30, sameSite: 'strict' });
  }

  /**
   * Clear authentication tokens
   */
  private clearTokens(): void {
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
  }
}

export const authService = new AuthService();
export default authService;
