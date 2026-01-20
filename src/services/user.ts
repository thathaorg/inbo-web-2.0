import apiClient from '@/utils/api';
import cacheManager from '@/utils/cache';

/* ---------------------------------------------------------------- */
/* ENDPOINTS */
/* ---------------------------------------------------------------- */
const USER_ENDPOINTS = {
  CHECK_INBOX_AVAILABILITY: '/api/user/check-inbox-availability/',
  GET_SUGGESTED_USERNAMES: '/api/user/get-suggested-usernames/',
  CREATE_INBOX: '/api/user/create-inbox/',
  PROFILE: '/api/user/profile/',
  STORAGE_INFO: '/api/user/storage-info/',
  STREAK_COUNT: '/api/user/streak-count/',
  GLOBAL_STATS: '/api/user/global-stats/',
  ONBOARDING: '/api/user/onboarding/',
  ONBOARDING_STATUS: '/api/user/onboarding/status/',
  SUBSCRIPTIONS: '/api/user/subscriptions/',
  FOLDERS: '/api/user/folders/',
  TOGGLE_SUBSCRIPTION: '/api/user/toggle-subscription/',
} as const;

const DIRECTORY_ENDPOINTS = {
  CATEGORIES: '/api/directory/categories/',
} as const;

/* ---------------------------------------------------------------- */
/* CACHE CONFIGURATION */
/* ---------------------------------------------------------------- */
const PROFILE_CACHE_TTL = 10 * 60 * 1000; // 10 minutes
const STORAGE_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const STREAK_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const SUBSCRIPTIONS_CACHE_KEY = 'user_subscriptions';
const SUBSCRIPTIONS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// In-memory cache for profile (survives page navigation)
let profileCache: { data: UserProfileResponse | null; timestamp: number } = {
  data: null,
  timestamp: 0,
};

let storageCache: { data: StorageInfoResponse | null; timestamp: number } = {
  data: null,
  timestamp: 0,
};

let streakCache: { data: StreakCountResponse | null; timestamp: number } = {
  data: null,
  timestamp: 0,
};

/* ---------------------------------------------------------------- */
/* HELPER FUNCTIONS */
/* ---------------------------------------------------------------- */
const logApiError = (endpoint: string, error: any) => {
  console.error(`❌ API Error [${endpoint}]:`);
  console.error('  Status:', error.response?.status);
  console.error('  Response Data:', JSON.stringify(error.response?.data, null, 2));
};

function isCacheValid<T>(cache: { data: T | null; timestamp: number }, ttl: number): boolean {
  return cache.data !== null && (Date.now() - cache.timestamp) < ttl;
}

/* ---------------------------------------------------------------- */
/* TYPES */
/* ---------------------------------------------------------------- */
export interface InboxAvailabilityResponse {
  available: boolean;
  message: string;
}

export interface SuggestedUsernamesResponse {
  suggestions: string[];
}

export interface CreateInboxResponse {
  success: boolean;
  inboxEmail: string;
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
  picture?: string | null;
}

export interface ProfileUpdateRequest {
  name?: string;
  birthYear?: string;
  gender?: string;
}

export interface StorageInfoResponse {
  used: number;
  total: number;
  percentage: number;
}

export interface StreakCountResponse {
  streak_count: number;
  longest_streak: number;
}

export interface Category {
  id: string | number;
  name: string;
  slug?: string;
  icon?: string;
  description?: string;
}

export interface CategoriesResponse {
  categories: Category[];
}

export interface OnboardingRequest {
  username?: string;
  categories?: string[];
  reminder?: string;
  reminderTime?: string;
  whereHeard?: string;
  notificationToken?: string;
}

export interface OnboardingResponse {
  success: boolean;
  message?: string;
}

export interface OnboardingStatusResponse {
  isComplete: boolean;
  hasUsername: boolean;
  hasCategories: boolean;
  categoryCount: number;
}

export interface Subscription {
  id: string;
  name: string;
  sender_email: string;
  email_count: number;
  first_received: string;
  last_received: string;
  is_active?: boolean;
}

export interface Folder {
  id: string;
  name: string;
  email_count: number;
  created_at: string;
  updated_at: string;
}

export interface ToggleSubscriptionResponse {
  id: string;
  newsletterId: string;
  newsletterName: string;
  logoUrl: string;
  subscribedAt: string;
  isActive: boolean;
}

/* ---------------------------------------------------------------- */
/* USER SERVICE CLASS */
/* ---------------------------------------------------------------- */
class UserService {
  /**
   * Check if a username is available for creating an inbox email address
   */
  async checkInboxAvailability(username: string): Promise<InboxAvailabilityResponse> {
    try {
      const response = await apiClient.get<InboxAvailabilityResponse>(
        USER_ENDPOINTS.CHECK_INBOX_AVAILABILITY,
        { params: { username } }
      );
      return response.data;
    } catch (error: any) {
      logApiError('CHECK_INBOX_AVAILABILITY', error);
      throw error;
    }
  }

  /**
   * Get suggested usernames for creating an inbox email address
   */
  async getSuggestedUsernames(name?: string, basedOn?: string): Promise<SuggestedUsernamesResponse> {
    try {
      const params: Record<string, string> = {};
      if (name) params.name = name;
      if (basedOn) params.basedOn = basedOn;

      const response = await apiClient.get<SuggestedUsernamesResponse>(
        USER_ENDPOINTS.GET_SUGGESTED_USERNAMES,
        { params }
      );
      return response.data;
    } catch (error: any) {
      logApiError('GET_SUGGESTED_USERNAMES', error);
      throw error;
    }
  }

  /**
   * Create an inbox email address for the authenticated user
   */
  async createInbox(username: string): Promise<CreateInboxResponse> {
    try {
      console.log('📤 Creating inbox with username:', username);
      const response = await apiClient.post<CreateInboxResponse>(
        USER_ENDPOINTS.CREATE_INBOX,
        { username }
      );
      console.log('✅ Inbox created:', response.data);
      // Invalidate profile cache since inbox status changed
      this.clearProfileCache();
      return response.data;
    } catch (error: any) {
      logApiError('CREATE_INBOX', error);
      throw error;
    }
  }

  /**
   * Get authenticated user's profile with smart caching
   * Uses in-memory cache to avoid repeated API calls
   */
  async getProfile(forceRefresh: boolean = false): Promise<UserProfileResponse> {
    // Return cached data if valid and not forcing refresh
    if (!forceRefresh && isCacheValid(profileCache, PROFILE_CACHE_TTL)) {
      console.log('✅ Using cached profile data');
      return profileCache.data!;
    }

    try {
      console.log('🔄 Fetching profile from API...');
      const response = await apiClient.get<UserProfileResponse>(USER_ENDPOINTS.PROFILE);
      
      // Update cache
      profileCache = {
        data: response.data,
        timestamp: Date.now(),
      };
      
      return response.data;
    } catch (error: any) {
      // If we have cached data and API fails, return cached data
      if (profileCache.data) {
        console.warn('⚠️ API failed, returning stale cached profile');
        return profileCache.data;
      }
      console.warn('Failed to fetch user profile:', error.message || error);
      throw error;
    }
  }

  /**
   * Update authenticated user's profile (PATCH /api/user/profile/)
   * Automatically updates the cache with new data
   */
  async updateProfile(payload: ProfileUpdateRequest): Promise<UserProfileResponse> {
    try {
      console.log('📤 Updating profile:', payload);
      const response = await apiClient.patch<UserProfileResponse>(USER_ENDPOINTS.PROFILE, payload);
      
      // Update cache with new data
      profileCache = {
        data: response.data,
        timestamp: Date.now(),
      };
      
      console.log('✅ Profile updated successfully');
      return response.data;
    } catch (error: any) {
      logApiError('PROFILE_UPDATE', error);
      throw error;
    }
  }

  /**
   * Clear profile cache (useful after profile updates from other sources)
   */
  clearProfileCache(): void {
    profileCache = { data: null, timestamp: 0 };
    console.log('🧹 Profile cache cleared');
  }

  /**
   * Get cached profile synchronously (returns null if not cached)
   */
  getCachedProfile(): UserProfileResponse | null {
    if (isCacheValid(profileCache, PROFILE_CACHE_TTL)) {
      return profileCache.data;
    }
    return null;
  }

  /**
   * Get storage usage information with caching
   */
  async getStorageInfo(forceRefresh: boolean = false): Promise<StorageInfoResponse> {
    if (!forceRefresh && isCacheValid(storageCache, STORAGE_CACHE_TTL)) {
      console.log('✅ Using cached storage info');
      return storageCache.data!;
    }

    try {
      console.log('🔄 Fetching storage info from API...');
      const response = await apiClient.get<StorageInfoResponse>(USER_ENDPOINTS.STORAGE_INFO);
      
      storageCache = {
        data: response.data,
        timestamp: Date.now(),
      };
      
      return response.data;
    } catch (error: any) {
      if (storageCache.data) {
        console.warn('⚠️ API failed, returning stale cached storage info');
        return storageCache.data;
      }
      logApiError('STORAGE_INFO', error);
      throw error;
    }
  }

  /**
   * Get reading streak count with caching
   */
  async getStreakCount(forceRefresh: boolean = false): Promise<StreakCountResponse> {
    if (!forceRefresh && isCacheValid(streakCache, STREAK_CACHE_TTL)) {
      console.log('✅ Using cached streak count');
      return streakCache.data!;
    }

    try {
      console.log('🔄 Fetching streak count from API...');
      const response = await apiClient.get<StreakCountResponse>(USER_ENDPOINTS.STREAK_COUNT);
      
      streakCache = {
        data: response.data,
        timestamp: Date.now(),
      };
      
      return response.data;
    } catch (error: any) {
      if (streakCache.data) {
        console.warn('⚠️ API failed, returning stale cached streak count');
        return streakCache.data;
      }
      logApiError('STREAK_COUNT', error);
      throw error;
    }
  }

  /**
   * Get all newsletter categories (public endpoint)
   */
  async getCategories(): Promise<CategoriesResponse> {
    try {
      const response = await apiClient.get<CategoriesResponse>(DIRECTORY_ENDPOINTS.CATEGORIES);
      return response.data;
    } catch (error: any) {
      logApiError('CATEGORIES', error);
      throw error;
    }
  }

  /**
   * Complete user onboarding
   */
  async completeOnboarding(data: OnboardingRequest): Promise<OnboardingResponse> {
    try {
      console.log('📤 Onboarding request data:', JSON.stringify(data, null, 2));
      const response = await apiClient.post<OnboardingResponse>(USER_ENDPOINTS.ONBOARDING, data);
      console.log('✅ Onboarding response:', response.data);
      // Invalidate profile cache since onboarding affects profile
      this.clearProfileCache();
      return response.data;
    } catch (error: any) {
      logApiError('ONBOARDING', error);
      throw error;
    }
  }

  /**
   * Get onboarding status
   */
  async getOnboardingStatus(): Promise<OnboardingStatusResponse> {
    try {
      const response = await apiClient.get<OnboardingStatusResponse>(USER_ENDPOINTS.ONBOARDING_STATUS);
      return response.data;
    } catch (error: any) {
      logApiError('ONBOARDING_STATUS', error);
      throw error;
    }
  }

  /**
   * Get user's newsletter subscriptions with caching
   */
  async getSubscriptions(forceRefresh: boolean = false): Promise<Subscription[]> {
    const cacheKey = SUBSCRIPTIONS_CACHE_KEY;
    
    if (!forceRefresh) {
      const cached = cacheManager.get<Subscription[]>(cacheKey);
      if (cached) {
        console.log('✅ Using cached subscriptions');
        return cached;
      }
    }

    try {
      console.log('🔄 Fetching subscriptions from API...');
      const response = await apiClient.get<Subscription[]>(USER_ENDPOINTS.SUBSCRIPTIONS);
      cacheManager.set(cacheKey, response.data, SUBSCRIPTIONS_CACHE_TTL);
      return response.data;
    } catch (error: any) {
      logApiError('SUBSCRIPTIONS', error);
      throw error;
    }
  }

  /**
   * Toggle subscription status (subscribe/unsubscribe/active/inactive)
   */
  async toggleSubscription(newsletterId: string, isAccepted: boolean): Promise<ToggleSubscriptionResponse> {
    try {
      const response = await apiClient.patch<ToggleSubscriptionResponse>(
        USER_ENDPOINTS.TOGGLE_SUBSCRIPTION,
        { newsletterId, isAccepted }
      );
      // Invalidate subscriptions cache
      cacheManager.invalidate(SUBSCRIPTIONS_CACHE_KEY);
      return response.data;
    } catch (error: any) {
      logApiError('TOGGLE_SUBSCRIPTION', error);
      throw error;
    }
  }

  /**
   * Get user's folders/collections
   */
  async getFolders(): Promise<Folder[]> {
    try {
      const response = await apiClient.get<Folder[]>(USER_ENDPOINTS.FOLDERS);
      return response.data;
    } catch (error: any) {
      logApiError('FOLDERS', error);
      throw error;
    }
  }

  /**
   * Prefetch all profile-related data in parallel (for profile page)
   * This is more efficient than fetching each piece separately
   */
  async prefetchProfileData(): Promise<{
    profile: UserProfileResponse;
    storage: StorageInfoResponse | null;
    streak: StreakCountResponse | null;
  }> {
    console.log('🚀 Prefetching all profile data...');
    
    const [profile, storage, streak] = await Promise.all([
      this.getProfile(),
      this.getStorageInfo().catch(e => {
        console.warn('Failed to fetch storage info:', e);
        return null;
      }),
      this.getStreakCount().catch(e => {
        console.warn('Failed to fetch streak count:', e);
        return null;
      }),
    ]);

    return { profile, storage, streak };
  }
}

export const userService = new UserService();
export default userService;
