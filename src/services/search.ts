import apiClient from '@/utils/api';

export interface EmailSearchResult {
  id: string;
  sender: string;
  subject: string;
  contentPreview?: string | null;
  dateReceived?: string | null;
  isRead: boolean;
  newsletterName?: string | null;
  newsletterLogo?: string | null;
  logoUrl?: string | null;  // API might return logoUrl directly
}

export interface NewsletterSearchResult {
  id: string;
  name: string;
  url: string;
  domain: string;
  author?: string;
  description?: string;
  logo?: string;
  icon_url?: string;  // API returns icon_url for newsletters
  logo_url?: string;  // Alternative field
}

export interface SearchResults {
  emails: EmailSearchResult[];
  newsletters: NewsletterSearchResult[];
  totalEmails: number;
  totalNewsletters: number;
}

class SearchService {
  /**
   * Search emails in user's inbox
   * API: GET /api/email/search/emails/?q={query}&page={page}
   * Response: { emails: EmailListItem[], total: number }
   */
  async searchEmails(query: string, page: number = 1): Promise<{ data: EmailSearchResult[]; total: number }> {
    if (!query.trim()) {
      return { data: [], total: 0 };
    }

    try {
      console.log('🔍 Searching emails:', query);
      const response = await apiClient.get('/api/email/search/emails/', {
        params: { q: query, page }
      });
      
      console.log('📧 Email search response:', response.data);
      
      // Response format: { emails: [], total: number }
      const emails = response.data?.emails || [];
      const total = response.data?.total || emails.length;
      
      return { data: emails, total };
    } catch (error: any) {
      console.error('❌ Failed to search emails:', error?.response?.data || error.message);
      return { data: [], total: 0 };
    }
  }

  /**
   * Search newsletters in directory
   * API: GET /api/directory/search/?query={query}&page={page}&limit={limit}
   */
  async searchNewsletters(
    query: string, 
    category?: string, 
    page: number = 1, 
    limit: number = 20
  ): Promise<{ data: NewsletterSearchResult[]; total: number }> {
    if (!query.trim() && !category) {
      return { data: [], total: 0 };
    }

    try {
      const params: any = { page, limit };
      if (query.trim()) params.query = query;
      if (category) params.category = category;

      console.log('🔍 Searching newsletters:', params);
      const response = await apiClient.get('/api/directory/search/', { params });
      console.log('📰 Newsletter search response:', response.data);
      
      const data = response.data?.data || [];
      const total = response.data?.total || data.length;
      
      return { data, total };
    } catch (error: any) {
      console.error('❌ Failed to search newsletters:', error?.response?.data || error.message);
      return { data: [], total: 0 };
    }
  }

  /**
   * Get quick preview of newsletter search results (max 5)
   * API: GET /api/directory/search-newsletters-preview/?search={query}
   */
  async searchNewslettersPreview(query: string): Promise<NewsletterSearchResult[]> {
    if (!query.trim()) return [];

    try {
      console.log('🔍 Newsletter preview search:', query);
      const response = await apiClient.get('/api/directory/search-newsletters-preview/', {
        params: { search: query }
      });
      
      console.log('📰 Newsletter preview response:', response.data);
      
      // Response could be array directly or { data: [] }
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return response.data?.data || response.data?.newsletters || [];
    } catch (error: any) {
      console.error('❌ Failed to get newsletters preview:', error?.response?.data || error.message);
      return [];
    }
  }

  /**
   * Combined search for dropdown (quick preview)
   */
  async quickSearch(query: string, context: 'inbox' | 'discover' | 'all' = 'all'): Promise<SearchResults> {
    if (!query.trim()) {
      return { emails: [], newsletters: [], totalEmails: 0, totalNewsletters: 0 };
    }

    console.log('🔎 Quick search:', query, 'context:', context);

    try {
      const promises: Promise<any>[] = [];

      // Search emails if in inbox context or all
      if (context === 'inbox' || context === 'all') {
        promises.push(
          this.searchEmails(query, 1).catch(() => ({ data: [], total: 0 }))
        );
      } else {
        promises.push(Promise.resolve({ data: [], total: 0 }));
      }

      // Search newsletters if in discover context or all
      if (context === 'discover' || context === 'all') {
        promises.push(
          this.searchNewslettersPreview(query).catch(() => [])
        );
      } else {
        promises.push(Promise.resolve([]));
      }

      const [emailResults, newsletterResults] = await Promise.all(promises);

      // Ensure arrays and normalize logo fields
      const rawEmails = Array.isArray(emailResults?.data) ? emailResults.data : [];
      const rawNewsletters = Array.isArray(newsletterResults) ? newsletterResults : [];

      // Normalize email results to ensure newsletterLogo is set from logoUrl if available
      const emails = rawEmails.map((email: any) => ({
        ...email,
        newsletterLogo: email.newsletterLogo || email.logoUrl || email.newsletter_logo || email.logo_url || null,
      }));

      // Normalize newsletter results to ensure logo is set from icon_url if available
      const newsletters = rawNewsletters.map((nl: any) => ({
        ...nl,
        logo: nl.logo || nl.icon_url || nl.logo_url || null,
      }));

      console.log('✅ Quick search results:', { emails: emails.length, newsletters: newsletters.length });

      return {
        emails: emails.slice(0, 5),
        newsletters: newsletters.slice(0, 5),
        totalEmails: emailResults?.total || 0,
        totalNewsletters: newsletters.length
      };
    } catch (error) {
      console.error('❌ Quick search failed:', error);
      return { emails: [], newsletters: [], totalEmails: 0, totalNewsletters: 0 };
    }
  }
}

const searchService = new SearchService();
export default searchService;
