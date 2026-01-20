import apiClient from '@/utils/api';

export interface NewsletterPreference {
  id: string;
  profile: string;
  newsletter_id: string;
  newsletter_name: string;
  newsletter_url: string;
  logo_url: string;
  is_subscribed: boolean;
  is_favorite: boolean;
  subscribed_at: string;
}

export interface NewsletterPost {
  id: string;
  newsletter_id: string;
  newsletter_name: string;
  newsletter_icon_url: string;
  title: string;
  summary: string;
  content: string; // HTML content
  published_at: string;
  url: string; // Link to original post
  is_read: boolean;
  is_bookmarked: boolean;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

const NEWSLETTER_ENDPOINTS = {
  PREFERENCES: '/api/newsletter-profile/v1/preferences/',
  POSTS: '/api/newsletter-profile/v1/posts/',
} as const;

class NewsletterService {
  /**
   * Get all newsletter preferences (subscriptions)
   */
  async getPreferences(params: {
    page?: number;
    page_size?: number;
    search?: string;
  } = {}): Promise<PaginatedResponse<NewsletterPreference>> {
    try {
      const response = await apiClient.get<PaginatedResponse<NewsletterPreference>>(
        NEWSLETTER_ENDPOINTS.PREFERENCES,
        { params }
      );
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch preferences:', error);
      throw error;
    }
  }

  /**
   * Create a new subscription
   */
  async subscribe(newsletterId: string): Promise<NewsletterPreference> {
    try {
      // Note: We don't need to pass profile ID if the backend infers it from auth token
      const response = await apiClient.post<NewsletterPreference>(
        NEWSLETTER_ENDPOINTS.PREFERENCES,
        {
          newsletter_id: newsletterId,
          is_subscribed: true,
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Failed to subscribe:', error);
      throw error;
    }
  }

  /**
   * Unsubscribe (Delete preference)
   */
  async unsubscribe(preferenceId: string): Promise<void> {
    try {
      await apiClient.delete(
        `${NEWSLETTER_ENDPOINTS.PREFERENCES}${preferenceId}/`
      );
    } catch (error: any) {
      console.error('Failed to unsubscribe:', error);
      throw error;
    }
  }

  /**
   * Toggle subscription status (Update preference)
   * Note: This might be redundant if we use create/delete for subscribe/unsubscribe,
   * but useful if we want to keep the preference object but mark as unsubscribed.
   */
  async updatePreference(preferenceId: string, data: { is_subscribed?: boolean; is_favorite?: boolean }): Promise<NewsletterPreference> {
    try {
      const response = await apiClient.patch<NewsletterPreference>(
        `${NEWSLETTER_ENDPOINTS.PREFERENCES}${preferenceId}/`,
        data
      );
      return response.data;
    } catch (error: any) {
      console.error('Failed to update preference:', error);
      throw error;
    }
  }

  /**
   * Get posts (User's feed)
   * Can use search to filter by newsletter name/content
   */
  async getPosts(params: {
    page?: number;
    page_size?: number;
    search?: string;
    ordering?: string;
  } = {}): Promise<PaginatedResponse<NewsletterPost>> {
    try {
      const response = await apiClient.get<PaginatedResponse<NewsletterPost>>(
        NEWSLETTER_ENDPOINTS.POSTS,
        { params }
      );
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch posts:', error);
      throw error;
    }
  }
}

export default new NewsletterService();
