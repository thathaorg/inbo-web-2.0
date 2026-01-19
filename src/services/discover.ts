import apiClient from '@/utils/api';

// Types for Discover API responses
export interface Category {
  id: string;
  name: string;
  level: number;
}

export interface Newsletter {
  id: string;
  name: string;
  url: string;
  domain: string | null;
  author: string | null;
  description: string | null;
  targetAudience?: string | null;
  valueProposition?: string | null;
  language?: string | null;
  contentFrequency?: string | null;
  location?: string | null;
  categories?: string[];
  tags?: string[];
  crossTags?: string[];
  tones?: string[];
  audienceLevels?: string[];
  contentIntents?: string[];
  contentFormats?: string[];
}

export interface NewsletterSearchResponse {
  data: Newsletter[];
  total: number;
  page: number;
  limit: number;
}

export interface SubscribeRequest {
  newsletter_id: string;
}

export interface SubscribeResponse {
  success: boolean;
  message?: string;
}

const DISCOVER_ENDPOINTS = {
  CATEGORIES: '/api/directory/categories/',
  SEARCH: '/api/directory/search/',
  NEWSLETTER_DETAILS: '/api/directory/',
  CATEGORY_PREVIEW: '/api/directory/search-category-newsletters-preview/',
  RECOMMENDATIONS: '/api/directory/recommendations/',
  TRENDING: '/api/recommendation/recommendations/trending/',
  SUBSCRIBE: '/api/user/newsletter/subscribe/',
  UNSUBSCRIBE: '/api/user/newsletter/unsubscribe/',
} as const;

class DiscoverService {
  /**
   * Get all newsletter categories (public endpoint)
   */
  async getCategories(): Promise<Category[]> {
    try {
      const response = await apiClient.get<Category[]>(DISCOVER_ENDPOINTS.CATEGORIES);
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch categories:', error);
      throw error;
    }
  }

  /**
   * Get top-level categories only (level 1-2)
   */
  async getTopCategories(limit: number = 20): Promise<Category[]> {
    try {
      const categories = await this.getCategories();
      // Filter to get unique category names, prioritizing lower levels
      const uniqueCategories = new Map<string, Category>();
      
      // Common top-level categories we want to display
      const topCategoryNames = [
        'Technology', 'AI', 'Business', 'Finance', 'Startups',
        'Marketing', 'Design', 'Productivity', 'Health', 'Crypto',
        'Culture', 'Career', 'Economics', 'Current Affairs'
      ];
      
      for (const cat of categories) {
        if (topCategoryNames.includes(cat.name) && !uniqueCategories.has(cat.name)) {
          uniqueCategories.set(cat.name, cat);
        }
      }
      
      return Array.from(uniqueCategories.values()).slice(0, limit);
    } catch (error: any) {
      console.error('Failed to fetch top categories:', error);
      throw error;
    }
  }

  /**
   * Search newsletters with optional filters (public endpoint)
   */
  async searchNewsletters(params: {
    query?: string;
    category?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<NewsletterSearchResponse> {
    try {
      const response = await apiClient.get<NewsletterSearchResponse>(DISCOVER_ENDPOINTS.SEARCH, {
        params: {
          query: params.query,
          category: params.category,
          page: params.page || 1,
          limit: params.limit || 20,
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Failed to search newsletters:', error);
      throw error;
    }
  }

  /**
   * Get newsletters by category preview (up to 5 results - public endpoint)
   */
  async getNewslettersByCategory(categoryName: string): Promise<Newsletter[]> {
    try {
      const response = await apiClient.get<Newsletter[]>(DISCOVER_ENDPOINTS.CATEGORY_PREVIEW, {
        params: { categoryname: categoryName },
      });
      return response.data;
    } catch (error: any) {
      console.error(`Failed to fetch newsletters for category ${categoryName}:`, error);
      throw error;
    }
  }

  /**
   * Get newsletter details by ID (public endpoint)
   */
  async getNewsletterDetails(id: string): Promise<Newsletter> {
    try {
      const response = await apiClient.get<Newsletter>(`${DISCOVER_ENDPOINTS.NEWSLETTER_DETAILS}${id}/`);
      return response.data;
    } catch (error: any) {
      console.error(`Failed to fetch newsletter details for ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get personalized recommendations (requires auth)
   */
  async getRecommendations(limit: number = 10): Promise<Newsletter[]> {
    try {
      const response = await apiClient.get<{ data: Newsletter[] }>(DISCOVER_ENDPOINTS.RECOMMENDATIONS, {
        params: { limit },
      });
      return response.data.data || response.data as unknown as Newsletter[];
    } catch (error: any) {
      console.error('Failed to fetch recommendations:', error);
      // Fall back to popular newsletters if recommendations fail
      return this.getPopularNewsletters(limit);
    }
  }

  /**
   * Get trending recommendations (requires auth)
   */
  async getTrendingNewsletters(limit: number = 10): Promise<Newsletter[]> {
    try {
      const response = await apiClient.get<any>(DISCOVER_ENDPOINTS.TRENDING, {
        params: { k: limit },
      });
      // Transform recommendation response to newsletter format
      const data = response.data.data || response.data;
      if (Array.isArray(data)) {
        return data.map((item: any) => ({
          id: item.item_id || item.id,
          name: item.item_name || item.name,
          url: item.item_url || item.url,
          description: item.reason || item.description,
          domain: item.domain || null,
          author: item.author || null,
        }));
      }
      return [];
    } catch (error: any) {
      console.error('Failed to fetch trending newsletters:', error);
      // Fall back to search if trending fails
      return this.getPopularNewsletters(limit);
    }
  }

  /**
   * Get popular newsletters (public fallback)
   */
  async getPopularNewsletters(limit: number = 10): Promise<Newsletter[]> {
    try {
      const response = await this.searchNewsletters({ limit });
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch popular newsletters:', error);
      return [];
    }
  }

  /**
   * Subscribe to a newsletter (requires auth)
   */
  async subscribeToNewsletter(newsletterId: string): Promise<SubscribeResponse> {
    try {
      const response = await apiClient.post<SubscribeResponse>(DISCOVER_ENDPOINTS.SUBSCRIBE, {
        newsletter_id: newsletterId,
      });
      return { success: true, message: 'Subscribed successfully' };
    } catch (error: any) {
      console.error('Failed to subscribe to newsletter:', error);
      throw error;
    }
  }

  /**
   * Unsubscribe from a newsletter (requires auth)
   */
  async unsubscribeFromNewsletter(newsletterId: string): Promise<SubscribeResponse> {
    try {
      const response = await apiClient.post<SubscribeResponse>(DISCOVER_ENDPOINTS.UNSUBSCRIBE, {
        newsletter_id: newsletterId,
      });
      return { success: true, message: 'Unsubscribed successfully' };
    } catch (error: any) {
      console.error('Failed to unsubscribe from newsletter:', error);
      throw error;
    }
  }
}

export const discoverService = new DiscoverService();
export default discoverService;
