'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { authService, type VerifyOTPResponse, type UserProfileResponse } from '@/services/auth';
import cacheManager, { CACHE_KEYS, DATA_TTL } from '@/utils/cache';
import { proactiveTokenRefresh } from '@/utils/api';
import type {
  GoogleAuthRequest,
  AppleAuthRequest,
} from '@/types/auth';

// Storage keys for persistent user data
const STORAGE_KEYS = {
  USER_CACHE: 'inbo_user_cache',
  LAST_FETCH: 'inbo_user_last_fetch',
} as const;

// Token refresh interval (5 minutes)
const TOKEN_REFRESH_INTERVAL = 5 * 60 * 1000;

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
  picture?: string | null;
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
  // Track if a fetch is already in progress
  const isFetchingRef = useRef(false);

  /**
   * Save user data to persistent storage (localStorage + cache)
   */
  const saveUserToStorage = useCallback((user: User) => {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_CACHE, JSON.stringify(user));
      localStorage.setItem(STORAGE_KEYS.LAST_FETCH, Date.now().toString());
      // Also cache in memory for faster access
      cacheManager.set(CACHE_KEYS.USER_COMPLETE_DATA, user, DATA_TTL.USER_COMPLETE_DATA, true);
      console.log('💾 User data cached successfully');
    } catch (e) {
      console.warn('Failed to cache user data:', e);
    }
  }, []);

  /**
   * Load user data from persistent storage
   */
  const loadUserFromStorage = useCallback((): User | null => {
    try {
      // First check memory cache
      const cached = cacheManager.get<User>(CACHE_KEYS.USER_COMPLETE_DATA);
      if (cached) {
        console.log('⚡ User loaded from memory cache');
        return cached;
      }

      // Then check localStorage
      const stored = localStorage.getItem(STORAGE_KEYS.USER_CACHE);
      if (stored) {
        const user = JSON.parse(stored) as User;
        // Restore to memory cache
        cacheManager.set(CACHE_KEYS.USER_COMPLETE_DATA, user, DATA_TTL.USER_COMPLETE_DATA, false);
        console.log('📦 User loaded from localStorage');
        return user;
      }
    } catch (e) {
      console.warn('Failed to load cached user:', e);
    }
    return null;
  }, []);

  /**
   * Check if user data needs refresh (older than 30 minutes)
   */
  const needsRefresh = useCallback((): boolean => {
    try {
      const lastFetch = localStorage.getItem(STORAGE_KEYS.LAST_FETCH);
      if (!lastFetch) return true;
      const age = Date.now() - parseInt(lastFetch, 10);
      return age > DATA_TTL.USER_COMPLETE_DATA;
    } catch {
      return true;
    }
  }, []);

  /**
   * Clear all user data from storage
   */
  const clearUserStorage = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEYS.USER_CACHE);
      localStorage.removeItem(STORAGE_KEYS.LAST_FETCH);
      cacheManager.invalidate(CACHE_KEYS.USER_COMPLETE_DATA);
      cacheManager.invalidate(CACHE_KEYS.USER_PROFILE);
    } catch (e) {
      console.warn('Failed to clear user cache:', e);
    }
  }, []);

  const refreshUser = useCallback(async (forceRefresh: boolean = false) => {
    // Prevent duplicate API calls
    if (isFetchingRef.current) {
      console.log('⏳ User fetch already in progress, skipping...');
      return;
    }

    try {
      if (!authService.isAuthenticated()) {
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
        return;
      }

      // Try to load from cache first (instant UI)
      const cachedUser = loadUserFromStorage();
      if (cachedUser && !forceRefresh) {
        setState({
          user: cachedUser,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        
        // If data is stale, refresh in background
        if (needsRefresh()) {
          console.log('🔄 User data is stale, refreshing in background...');
          isFetchingRef.current = true;
          authService.getCurrentUser()
            .then((userProfile) => {
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
                picture: userProfile.picture,
              };
              saveUserToStorage(user);
              setState(prev => ({ ...prev, user }));
            })
            .catch((e) => console.warn('Background user refresh failed:', e))
            .finally(() => { isFetchingRef.current = false; });
        }
        return;
      }

      // No cache or force refresh - fetch from API
      isFetchingRef.current = true;
      
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 35000)
      );
      
      const userProfilePromise = authService.getCurrentUser();
      const userProfile = await Promise.race([userProfilePromise, timeoutPromise]) as UserProfileResponse;
      
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
        picture: userProfile.picture,
      };
      
      // Cache user data
      saveUserToStorage(user);
      
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      console.warn('Auth check failed:', error.message);
      
      // On error, try to use cached data if available
      const cachedUser = loadUserFromStorage();
      if (cachedUser && authService.isAuthenticated()) {
        console.log('✅ Using cached user data after fetch error');
        setState({
          user: cachedUser,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return;
      }
      
      // No cache available, set to unauthenticated
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } finally {
      isFetchingRef.current = false;
    }
  }, [loadUserFromStorage, saveUserToStorage, needsRefresh]);

  useEffect(() => {
    // Ensure we only attempt restore once during client mount to avoid loops
    if (hasTriedRestoreRef.current) return;
    hasTriedRestoreRef.current = true;

    // Run restore
    refreshUser();
  }, [refreshUser]);

  // Proactive token refresh to keep session alive
  useEffect(() => {
    if (!state.isAuthenticated) return;

    // Refresh token every 5 minutes to prevent unexpected logouts
    const intervalId = setInterval(() => {
      proactiveTokenRefresh().catch((e) => {
        console.warn('Proactive token refresh failed:', e);
      });
    }, TOKEN_REFRESH_INTERVAL);

    // Also refresh on visibility change (when user comes back to tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && state.isAuthenticated) {
        proactiveTokenRefresh().catch((e) => {
          console.warn('Visibility token refresh failed:', e);
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [state.isAuthenticated]);

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
        // Note: These might not be in verify response, will be fetched in refreshUser
        inboxEmail: undefined,
        username: undefined,
      };
      
      // Save to storage immediately
      saveUserToStorage(user);
      
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      
      // Fetch complete user data in background (includes inboxEmail, etc.)
      setTimeout(() => refreshUser(true), 500);
      
      return response;
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error?.response?.data?.message || 'OTP verification failed',
      }));
      throw error;
    }
  }, [saveUserToStorage, refreshUser]);

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
      
      // Save to storage
      saveUserToStorage(user);
      
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      
      // Fetch complete user data in background
      setTimeout(() => refreshUser(true), 500);
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error?.response?.data?.message || 'Google authentication failed',
      }));
      throw error;
    }
  }, [saveUserToStorage, refreshUser]);

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
      
      // Save to storage
      saveUserToStorage(user);
      
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      
      // Fetch complete user data in background
      setTimeout(() => refreshUser(true), 500);
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error?.response?.data?.message || 'Apple authentication failed',
      }));
      throw error;
    }
  }, [saveUserToStorage, refreshUser]);

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
      // Clear all cached user data
      clearUserStorage();
      cacheManager.invalidateAll();
      
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  }, [clearUserStorage]);

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
