import apiClient from '@/utils/api';

// Cache for newsletter provider info to avoid repeated API calls
const newsletterProviderCache = new Map<string, { logo: string | null; name: string | null }>();

export interface EmailListItem {
  id: string;
  sender: string;
  subject: string;
  contentPreview?: string | null;
  dateReceived?: string | null;
  wordsCount?: number | null;
  isRead: boolean;
  isFavorite: boolean;
  isReadLater: boolean;
  // Optional fields that might come from API
  newsletterName?: string | null;
  newsletterLogo?: string | null;
  firstImage?: string | null;
}

export interface InboxResponse extends Array<EmailListItem> { }

export interface EmptyInboxResponse {
  pendingNewsletters?: number;
  emailsCount?: number;
}

export interface EmailDetail {
  id: string;
  sender: string;
  subject: string;
  contentPreview?: string | null;
  dateReceived?: string | null;
  wordsCount?: number | null;
  isRead: boolean;
  isFavorite: boolean;
  isReadLater: boolean;
  storagePath?: string | null;
  readingProgress?: number | null;
  body?: string | null;
  summary?: string | null;
  highlights?: any[] | null;
}

// API response type that might have snake_case fields
type EmailDetailApi = Partial<EmailDetail> & {
  content_preview?: string | null;
  date_received?: string | null;
  words_count?: number | null;
  is_read?: boolean;
  is_favorite?: boolean;
  is_read_later?: boolean;
  storage_path?: string | null;
  reading_progress?: number | null;
};

/**
 * Normalize email detail response from API
 * Handles both camelCase and snake_case responses
 */
function normalizeEmailDetail(item: EmailDetailApi): EmailDetail {
  return {
    id: item.id || '',
    sender: item.sender || '',
    subject: item.subject || '',
    contentPreview: item.contentPreview ?? item.content_preview ?? null,
    dateReceived: item.dateReceived ?? item.date_received ?? null,
    wordsCount: item.wordsCount ?? item.words_count ?? null,
    isRead: item.isRead ?? item.is_read ?? false,
    isFavorite: item.isFavorite ?? item.is_favorite ?? false,
    isReadLater: item.isReadLater ?? item.is_read_later ?? false,
    storagePath: item.storagePath ?? item.storage_path ?? null,
    readingProgress: item.readingProgress ?? item.reading_progress ?? null,
    body: item.body ?? null,
    summary: item.summary ?? null,
    highlights: item.highlights ?? null,
  };
}

// Some environments return snake_case despite the OpenAPI examples using camelCase.
// Normalize here so UI code can rely on a consistent shape.
type EmailListItemApi = Partial<EmailListItem> & {
  id?: string;
  sender?: string;
  subject?: string;
  contentPreview?: string | null;
  dateReceived?: string | null;
  wordsCount?: number | null;
  isRead?: boolean;
  isFavorite?: boolean;
  isReadLater?: boolean;
  newsletterName?: string | null;
  newsletterLogo?: string | null;
  firstImage?: string | null;
  // snake_case fallbacks
  content_preview?: string | null;
  date_received?: string | null;
  words_count?: number | null;
  is_read?: boolean;
  is_favorite?: boolean;
  is_read_later?: boolean;
  newsletter_name?: string | null;
  newsletter_logo?: string | null;
  first_image?: string | null;
};

/**
 * Extract newsletter name from sender email
 * e.g., "newsletter@example.com" -> "Newsletter" or "example"
 */
export function extractNewsletterName(sender: string): string {
  if (!sender) return 'Newsletter';

  // Extract name from email (part before @)
  const emailPart = sender.split('@')[0];
  if (!emailPart) return 'Newsletter';

  // Capitalize first letter and remove common prefixes
  let name = emailPart
    .replace(/^(newsletter|news|mail|noreply|no-reply)[-_.]?/i, '')
    .replace(/[-_.]/g, ' ');

  // Capitalize first letter of each word
  name = name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

  return name || 'Newsletter';
}

/**
 * Extract first image URL from HTML content
 * Returns the first valid image URL found, or null if none found
 */
export function extractFirstImage(htmlContent: string | null | undefined): string | null {
  if (!htmlContent) return null;

  try {
    const images: string[] = [];

    // Match img tags with src attribute
    const imgMatches = htmlContent.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi);
    for (const match of imgMatches) {
      if (match[1]) {
        const url = match[1].trim();
        const fullMatch = match[0];

        // Skip data URIs, tracking pixels, and empty src
        if (!url || url.startsWith('data:') || url.includes('1x1') || url.length < 15) {
          continue;
        }

        // Skip common header/footer/profile images by checking the img tag context
        const lowerUrl = url.toLowerCase();
        const lowerMatch = fullMatch.toLowerCase();

        // Skip if URL contains these patterns
        if (lowerUrl.includes('/icon') ||
          lowerUrl.includes('/logo') ||
          lowerUrl.includes('favicon') ||
          lowerUrl.includes('/avatar') ||
          lowerUrl.includes('/profile') ||
          lowerUrl.includes('/badge') ||
          lowerUrl.includes('header') ||
          lowerUrl.includes('footer') ||
          lowerUrl.includes('social') ||
          lowerUrl.includes('button')) {
          continue;
        }

        // Skip if img tag has class/id suggesting it's not article content
        if (lowerMatch.includes('class="logo') ||
          lowerMatch.includes('class="icon') ||
          lowerMatch.includes('class="avatar') ||
          lowerMatch.includes('class="profile') ||
          lowerMatch.includes('class="header') ||
          lowerMatch.includes('class="footer') ||
          lowerMatch.includes('id="logo') ||
          lowerMatch.includes('id="header')) {
          continue;
        }

        images.push(url);
      }
    }

    // Return first valid content image
    if (images.length > 0) {
      return images[0];
    }

    // Try background-image as fallback
    const bgMatch = htmlContent.match(/background-image:\s*url\(["']?([^"')]+)["']?\)/i);
    if (bgMatch && bgMatch[1]) {
      const url = bgMatch[1].trim();
      if (url && !url.startsWith('data:')) {
        return url;
      }
    }
  } catch (error) {
    console.warn('Error extracting image from content:', error);
  }

  return null;
}

/**
 * Fetch newsletter provider logo from directory API
 * Uses sender email domain to search for matching provider
 */
async function fetchNewsletterProviderLogo(sender: string): Promise<string | null> {
  if (!sender) return null;

  // Check cache first
  const cacheKey = sender.toLowerCase();
  if (newsletterProviderCache.has(cacheKey)) {
    return newsletterProviderCache.get(cacheKey)?.logo || null;
  }

  try {
    // Extract domain from sender email
    const domain = sender.split('@')[1];
    if (!domain) return null;

    // Search for provider by domain or sender email
    const searchQuery = domain.split('.')[0]; // Get main domain part

    const params = new URLSearchParams();
    params.append('q', searchQuery);
    params.append('page_size', '5');

    const response = await apiClient.get(`/api/search/providers/search/?${params.toString()}`);

    if (response.data?.results && response.data.results.length > 0) {
      const provider = response.data.results[0];
      const logo = provider.logo || provider.image || null;
      const name = provider.name || null;

      // Cache the result
      newsletterProviderCache.set(cacheKey, { logo, name });
      return logo;
    }

    // Cache null result to avoid repeated failed requests
    newsletterProviderCache.set(cacheKey, { logo: null, name: null });
  } catch (error) {
    // Silently fail - newsletter logos are optional, backend endpoint has issues
    // Cache null result to avoid repeated failed requests
    newsletterProviderCache.set(cacheKey, { logo: null, name: null });
  }

  return null;
}

/**
 * Fetch newsletter provider name from directory API
 */
async function fetchNewsletterProviderName(sender: string): Promise<string | null> {
  if (!sender) return null;

  const cacheKey = sender.toLowerCase();
  if (newsletterProviderCache.has(cacheKey)) {
    return newsletterProviderCache.get(cacheKey)?.name || null;
  }

  // If logo fetch already cached the name, return it
  // Otherwise, trigger a fetch (which will cache both)
  await fetchNewsletterProviderLogo(sender);

  return newsletterProviderCache.get(cacheKey)?.name || null;
}

function normalizeEmailListItem(item: EmailListItemApi): EmailListItem {
  const sender = item.sender ?? '';
  const contentPreview = item.contentPreview ?? item.content_preview ?? null;

  // Extract newsletter name (prefer API provided, then cache, then extract)
  const cachedName = newsletterProviderCache.get(sender.toLowerCase())?.name;
  const newsletterName = item.newsletterName ?? item.newsletter_name ?? cachedName ?? extractNewsletterName(sender);

  // Get logo from cache if available
  const cachedLogo = newsletterProviderCache.get(sender.toLowerCase())?.logo;
  const newsletterLogo = item.newsletterLogo ?? item.newsletter_logo ?? cachedLogo ?? null;

  // Extract first image from content
  const firstImage = item.firstImage ?? item.first_image ?? extractFirstImage(contentPreview);

  return {
    id: item.id ?? '',
    sender,
    subject: item.subject ?? '',
    contentPreview,
    dateReceived: item.dateReceived ?? item.date_received ?? null,
    wordsCount: item.wordsCount ?? item.words_count ?? null,
    isRead: item.isRead ?? item.is_read ?? false,
    isFavorite: item.isFavorite ?? item.is_favorite ?? false,
    isReadLater: item.isReadLater ?? item.is_read_later ?? false,
    newsletterName,
    firstImage,
    newsletterLogo,
  };
}

const EMAIL_ENDPOINTS = {
  INBOX: '/api/email/inbox/',
  READ_LATER_LIST: '/api/email/read-later/',
  FAVORITES: '/api/email/favorites/',
  TRASH: '/api/email/trash/',
  SEARCH: '/api/email/search/emails/',
  GET_EMAIL: '/api/email/{id}/',
  MARK_READ: '/api/email/{id}/progress/',
  FAVORITE: '/api/email/{id}/favorite/',
  TOGGLE_READ_LATER: '/api/email/{id}/readlater/',
  DELETE: '/api/email/{id}/trash/',
} as const;

class EmailService {
  /**
   * Get inbox emails with optional filtering
   */
  async getInboxEmails(
    filter: 'latest' | 'oldest' = 'latest',
    isRead?: boolean,
    page: number = 1
  ): Promise<EmailListItem[] | EmptyInboxResponse[]> {
    const params = new URLSearchParams();
    params.append('filter', filter);
    if (isRead !== undefined) {
      params.append('isRead', isRead.toString());
    }
    params.append('page', page.toString());

    const response = await apiClient.get<any>(
      `${EMAIL_ENDPOINTS.INBOX}?${params.toString()}`
    );

    // Handle paginated response structure: {data: Array, page, limit, total, hasNext}
    const responseData = response.data?.data ?? response.data ?? [];
    const data = Array.isArray(responseData) ? responseData : [];

    if (data.length > 0 && 'pendingNewsletters' in (data[0] as any)) {
      return data as unknown as EmptyInboxResponse[];
    }

    const emails = (data as EmailListItemApi[]).map(normalizeEmailListItem);

    // Fetch provider logos for emails that don't have them yet (in parallel)
    const logoPromises = emails.map(async (email) => {
      if (!email.newsletterLogo && email.sender) {
        const logo = await fetchNewsletterProviderLogo(email.sender);
        if (logo) {
          email.newsletterLogo = logo;
        }
      }
      return email;
    });

    // Wait for all logo fetches to complete
    await Promise.all(logoPromises);

    return emails;
  }

  /**
   * Get read later emails
   */
  async getReadLaterEmails(
    filter: 'latest' | 'oldest' = 'latest',
    page: number = 1
  ): Promise<InboxResponse> {
    const params = new URLSearchParams();
    params.append('filter', filter);
    params.append('page', page.toString());

    const response = await apiClient.get<any>(
      `${EMAIL_ENDPOINTS.READ_LATER_LIST}?${params.toString()}`
    );
    const responseData = response.data?.data ?? response.data ?? [];
    const data = Array.isArray(responseData) ? responseData : [];
    return (data as EmailListItemApi[]).map(normalizeEmailListItem);
  }

  /**
   * Get favorite emails
   */
  async getFavoriteEmails(
    filter: 'latest' | 'oldest' = 'latest',
    page: number = 1
  ): Promise<InboxResponse> {
    const params = new URLSearchParams();
    params.append('filter', filter);
    params.append('page', page.toString());

    const response = await apiClient.get<any>(
      `${EMAIL_ENDPOINTS.FAVORITES}?${params.toString()}`
    );
    const responseData = response.data?.data ?? response.data ?? [];
    const data = Array.isArray(responseData) ? responseData : [];
    return (data as EmailListItemApi[]).map(normalizeEmailListItem);
  }

  /**
   * Get trash emails
   */
  async getTrashEmails(
    filter: 'latest' | 'oldest' = 'latest',
    page: number = 1
  ): Promise<InboxResponse> {
    const params = new URLSearchParams();
    params.append('filter', filter);
    params.append('page', page.toString());

    const response = await apiClient.get<any>(
      `${EMAIL_ENDPOINTS.TRASH}?${params.toString()}`
    );
    const responseData = response.data?.data ?? response.data ?? [];
    const data = Array.isArray(responseData) ? responseData : [];
    return (data as EmailListItemApi[]).map(normalizeEmailListItem);
  }

  async markEmailAsRead(emailId: string): Promise<void> {
    try {
      // Re-enabled: Attempt to mark as read
      await apiClient.patch(EMAIL_ENDPOINTS.MARK_READ.replace('{id}', emailId), {
        is_read: true
      });
    } catch (error: any) {
      // Backend known issue: often returns 500 even if successful or if just tracking progress
      // We swallow the error so the UI updates optimistically
      console.warn('Backend reported error marking read (ignoring):', error.message);
    }
  }

  /**
   * Toggle email favorite status
   */
  async toggleFavorite(emailId: string, isFavorite: boolean): Promise<void> {
    await apiClient.patch(`/api/email/${emailId}/favorite/`, {
      isFavorite
    });
  }

  /**
   * Toggle email read later status
   */
  async toggleReadLater(emailId: string, isReadLater: boolean): Promise<void> {
    console.debug(`📤 Toggling read later for ${emailId} to ${isReadLater}`);
    await apiClient.patch(`/api/email/${emailId}/readlater/`, {
      isReadLater
    });
  }

  /**
   * Move email to trash
   */
  async moveToTrash(emailId: string): Promise<void> {
    console.debug(`📤 Moving email to trash: ${emailId}`);
    await apiClient.patch(`/api/email/${emailId}/trash/`, {});
  }

  /**
   * Permanently delete an email
   */
  async deleteEmail(emailId: string): Promise<void> {
    console.debug(`🗑️ Permanently deleting email: ${emailId}`);
    await apiClient.delete(`/api/email/${emailId}/delete/`);
  }

  /**
   * Get email details by ID
   */
  async getEmailDetail(emailId: string): Promise<EmailDetail> {
    try {
      const response = await apiClient.get<EmailDetailApi>(
        `/api/email/${emailId}/`
      );
      return normalizeEmailDetail(response.data);
    } catch (error: any) {
      console.error('Failed to fetch email detail:', error);
      throw error;
    }
  }
  /**
   * Add a highlight to an email
   */
  async addHighlight(emailId: string, text: string, selectionInfo: any, color: string = 'yellow'): Promise<any> {
    const response = await apiClient.post(`/api/email/${emailId}/highlight/`, {
      text,
      selectionInfo,
      color
    });
    return response.data;
  }
}

export default new EmailService();
