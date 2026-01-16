'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { authService, type VerifyOTPResponse, type UserProfileResponse } from '@/services/auth';
import type {
  GoogleAuthRequest,
  AppleAuthRequest,
} from '@/types/auth';

// User type based on API response
interface User {
  id: string;
  email: string;
  name: string | null;
  username?: string | null;
  isVerified: boolean;
  isInboxCreated: boolean;
  inboxEmail?: string | null;
  birthYear?: string | null;
  gender?: string | null;
  createdAt?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  sendOTP: (email: string) => Promise<{ success: boolean; message: string }>;
  verifyOTP: (email: string, otp: string) => Promise<VerifyOTPResponse>;
  logout: () => Promise<void>;
  googleAuth: (data: GoogleAuthRequest) => Promise<void>;
  appleAuth: (data: AppleAuthRequest) => Promise<void>;
  checkEmail: (email: string) => Promise<{ exists: boolean }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Prevent multiple refreshUser runs on mount
  const hasTriedRestoreRef = useRef(false);

  const refreshUser = useCallback(async () => {
    try {
      if (authService.isAuthenticated()) {
        // Add timeout to prevent infinite loading
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 35000)
        );
        
        const userProfilePromise = authService.getCurrentUser();
        const userProfile = await Promise.race([userProfilePromise, timeoutPromise]) as any;
        
        const user: User = {
          id: userProfile.id,
          email: userProfile.email,
          name: userProfile.name,
          username: userProfile.username,
          isVerified: userProfile.isVerified,
          isInboxCreated: userProfile.isInboxCreated,
          inboxEmail: userProfile.inboxEmail,
          birthYear: userProfile.birthYear,
          gender: userProfile.gender,
          createdAt: userProfile.createdAt,
        };
        
        // Cache user data in localStorage for offline/slow connection resilience
        try {
          localStorage.setItem('user_cache', JSON.stringify(user));
        } catch (e) {
          console.warn('Failed to cache user data:', e);
        }
        
        setState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    } catch (error: any) {
      console.warn('Auth check failed - using cached/partial data:', error.message);
      // On error, try to load cached user data from localStorage
      try {
        const cachedUser = localStorage.getItem('user_cache');
        if (cachedUser && authService.isAuthenticated()) {
          const user = JSON.parse(cachedUser) as User;
          console.log('✅ Using cached user data');
          setState({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          return;
        }
      } catch (e) {
        console.warn('Failed to load cached user:', e);
      }
      
      // No cache available, set to unauthenticated
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  }, []);

  useEffect(() => {
    // Ensure we only attempt restore once during client mount to avoid loops
    if (hasTriedRestoreRef.current) return;
    hasTriedRestoreRef.current = true;

    // Run restore
    refreshUser();
  }, [refreshUser]);

  const sendOTP = useCallback(async (email: string) => {
    try {
      return await authService.sendOTP(email);
    } catch (error: any) {
      throw error;
    }
  }, []);

  const verifyOTP = useCallback(async (email: string, otp: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await authService.verifyOTP(email, otp);
      const user: User = {
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        isVerified: response.user.isVerified,
        isInboxCreated: response.user.isInboxCreated,
      };
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return response;
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error?.response?.data?.message || 'OTP verification failed',
      }));
      throw error;
    }
  }, []);

  const googleAuth = useCallback(async (data: GoogleAuthRequest) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await authService.googleAuth(data);
      const user: User = {
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        isVerified: response.user.isVerified,
        isInboxCreated: response.user.isInboxCreated,
      };
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error?.response?.data?.message || 'Google authentication failed',
      }));
      throw error;
    }
  }, []);

  const appleAuth = useCallback(async (data: AppleAuthRequest) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await authService.appleAuth(data);
      const user: User = {
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        isVerified: response.user.isVerified,
        isInboxCreated: response.user.isInboxCreated,
      };
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error?.response?.data?.message || 'Apple authentication failed',
      }));
      throw error;
    }
  }, []);

  const checkEmail = useCallback(async (email: string) => {
    try {
      return await authService.checkEmail(email);
    } catch (error: any) {
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      await authService.logout();
    } catch (error) {
      // Even if logout fails, clear local state
      console.error('Logout error:', error);
    } finally {
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  }, []);

  const value: AuthContextType = {
    ...state,
    sendOTP,
    verifyOTP,
    logout,
    googleAuth,
    appleAuth,
    checkEmail,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
