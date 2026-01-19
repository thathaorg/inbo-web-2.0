import apiClient from '@/utils/api';
import cacheManager, { CACHE_TTL, CACHE_KEYS } from '@/utils/cache';

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
 * Extract newsletter name from sender string
 * Handles formats like: "TLDR Design <dan@tldrnewsletter.com>" -> "TLDR Design"
 * or "newsletter@example.com" -> "Newsletter"
 */
export function extractNewsletterName(sender: string): string {
  if (!sender) return 'Newsletter';

  // First, try to extract the display name from "Name <email>" format
  const displayNameMatch = sender.match(/^([^<]+)</);
  if (displayNameMatch && displayNameMatch[1]) {
    let name = displayNameMatch[1].trim();
    // Remove any remaining HTML-like tags or special chars
    name = name.replace(/<[^>]*>/g, '').replace(/[<>]/g, '').trim();
    if (name.length > 0 && name.length < 50) {
      return name;
    }
  }

  // Fallback: Extract name from email (part before @)
  const emailMatch = sender.match(/<([^>]+)>/) || [null, sender];
  const email = emailMatch[1] || sender;
  const emailPart = email.split('@')[0];
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
 * Clean content preview - removes HTML tags, excessive whitespace, and special characters
 */
export function cleanContentPreview(preview: string | null | undefined): string {
  if (!preview) return 'No preview available';

  let cleaned = preview
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove HTML entities
    .replace(/&[a-zA-Z0-9#]+;/g, ' ')
    // Remove URLs and links
    .replace(/\[[\d\w]+\]/g, '')
    // Remove excessive whitespace (including non-breaking spaces)
    .replace(/[\u00A0\u2002\u2003\u2009\u200A\u200B\u202F\u205F\u3000]/g, ' ')
    .replace(/\s+/g, ' ')
    // Remove leading/trailing whitespace
    .trim();

  // If preview is too short after cleaning, return default
  if (cleaned.length < 10) return 'No preview available';

  return cleaned;
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

  const cacheKey = CACHE_KEYS.NEWSLETTER_PROVIDER(sender);

  // Check cache first
  const cached = cacheManager.get<{ logo: string | null; name: string | null }>(cacheKey);
  if (cached !== null) {
    return cached.logo;
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

      // Cache the result with long TTL (rarely changes)
      cacheManager.set(cacheKey, { logo, name }, CACHE_TTL.VERY_LONG, true);
      return logo;
    }

    // Cache null result to avoid repeated failed requests
    cacheManager.set(cacheKey, { logo: null, name: null }, CACHE_TTL.LONG, true);
  } catch (error) {
    // Silently fail - newsletter logos are optional, backend endpoint has issues
    // Cache null result to avoid repeated failed requests
    cacheManager.set(cacheKey, { logo: null, name: null }, CACHE_TTL.MEDIUM);
  }

  return null;
}

/**
 * Fetch newsletter provider name from directory API
 */
async function fetchNewsletterProviderName(sender: string): Promise<string | null> {
  if (!sender) return null;

  const cacheKey = CACHE_KEYS.NEWSLETTER_PROVIDER(sender);
  const cached = cacheManager.get<{ logo: string | null; name: string | null }>(cacheKey);
  if (cached !== null) {
    return cached.name;
  }

  // If logo fetch already cached the name, return it
  // Otherwise, trigger a fetch (which will cache both)
  await fetchNewsletterProviderLogo(sender);

  const freshCached = cacheManager.get<{ logo: string | null; name: string | null }>(cacheKey);
  return freshCached?.name || null;
}

function normalizeEmailListItem(item: EmailListItemApi): EmailListItem {
  const sender = item.sender ?? '';
  const contentPreview = item.contentPreview ?? item.content_preview ?? null;

  // Extract newsletter name (prefer API provided, then cache, then extract)
  const cached = cacheManager.get<{ logo: string | null; name: string | null }>(CACHE_KEYS.NEWSLETTER_PROVIDER(sender));
  const cachedName = cached?.name;
  const newsletterName = item.newsletterName ?? item.newsletter_name ?? cachedName ?? extractNewsletterName(sender);

  // Get logo from cache if available
  const cachedLogo = cached?.logo;
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
   * Uses caching with request deduplication to prevent redundant API calls
   */
  async getInboxEmails(
    filter: 'latest' | 'oldest' = 'latest',
    isRead?: boolean,
    page: number = 1,
    forceRefresh: boolean = false
  ): Promise<EmailListItem[] | EmptyInboxResponse[]> {
    const cacheKey = CACHE_KEYS.INBOX_PAGE(page, isRead);

    // Use fetchWithCache for automatic caching and deduplication
    return cacheManager.fetchWithCache(
      cacheKey,
      async () => {
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
        // Using deduplication to prevent multiple requests for the same sender
        const uniqueSenders = new Set(emails.filter(e => !e.newsletterLogo && e.sender).map(e => e.sender));

        // Batch fetch logos for unique senders only
        const logoPromises = Array.from(uniqueSenders).map(sender =>
          cacheManager.deduplicateRequest(
            `logo:${sender}`,
            () => fetchNewsletterProviderLogo(sender)
          )
        );

        await Promise.all(logoPromises);

        // Update emails with cached logos
        emails.forEach(email => {
          if (!email.newsletterLogo && email.sender) {
            const cached = cacheManager.get<{ logo: string | null; name: string | null }>(
              CACHE_KEYS.NEWSLETTER_PROVIDER(email.sender)
            );
            if (cached?.logo) {
              email.newsletterLogo = cached.logo;
            }
          }
        });

        return emails;
      },
      {
        ttl: CACHE_TTL.SHORT,  // Short TTL for inbox (30 seconds)
        persist: false,
        forceRefresh,
        staleWhileRevalidate: true,
      }
    );
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
      // Mark as read - API expects camelCase "isRead"
      await apiClient.patch(EMAIL_ENDPOINTS.MARK_READ.replace('{id}', emailId), {
        isRead: true
      });
      // Invalidate inbox cache so next refresh shows updated read status
      cacheManager.invalidatePrefix(CACHE_KEYS.INBOX);
    } catch (error: any) {
      // Backend known issue: often returns 500 even if successful or if just tracking progress
      // We swallow the error so the UI updates optimistically
      console.warn('Backend reported error marking read (ignoring):', error.message);
    }
  }

  /**
   * Toggle email read status (mark as read/unread)
   */
  async toggleReadStatus(emailId: string, isRead: boolean): Promise<void> {
    try {
      // API expects camelCase "isRead"
      await apiClient.patch(EMAIL_ENDPOINTS.MARK_READ.replace('{id}', emailId), {
        isRead: isRead
      });
      // Invalidate inbox cache so next refresh shows updated read status
      cacheManager.invalidatePrefix(CACHE_KEYS.INBOX);
    } catch (error: any) {
      // Backend known issue: often returns 500 even if successful
      // Extract safe error message
      const errorMsg = error?.response?.data?.message 
        || error?.message 
        || 'Unknown error';
      console.warn('Backend reported error toggling read status (ignoring):', errorMsg);
    }
  }

  /**
   * Toggle email favorite status
   */
  async toggleFavorite(emailId: string, isFavorite: boolean): Promise<void> {
    await apiClient.patch(`/api/email/${emailId}/favorite/`, {
      isFavorite
    });
    // Invalidate caches that might contain this email
    cacheManager.invalidate(CACHE_KEYS.EMAIL_DETAIL(emailId));
    cacheManager.invalidatePrefix(CACHE_KEYS.INBOX);
    cacheManager.invalidatePrefix(CACHE_KEYS.FAVORITES);
    
    // Broadcast event so favorite page can update
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('favoriteChanged', {
        detail: { emailId, isFavorite, timestamp: new Date().toISOString() }
      });
      window.dispatchEvent(event);
    }
  }

  /**
   * Toggle email read later status
   */
  async toggleReadLater(emailId: string, isReadLater: boolean): Promise<void> {
    console.debug(`📤 Toggling read later for ${emailId} to ${isReadLater}`);
    await apiClient.patch(`/api/email/${emailId}/readlater/`, {
      isReadLater
    });
    // Invalidate caches that might contain this email
    cacheManager.invalidate(CACHE_KEYS.EMAIL_DETAIL(emailId));
    cacheManager.invalidatePrefix(CACHE_KEYS.INBOX);
    cacheManager.invalidatePrefix(CACHE_KEYS.READ_LATER);
    
    // Broadcast event so read later page can update
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('readLaterChanged', {
        detail: { emailId, isReadLater, timestamp: new Date().toISOString() }
      });
      window.dispatchEvent(event);
    }
  }

  /**
   * Move email to trash
   */
  async moveToTrash(emailId: string): Promise<void> {
    console.debug(`📤 Moving email to trash: ${emailId}`);
    await apiClient.patch(`/api/email/${emailId}/trash/`, {});
    // Invalidate all caches since email moved
    cacheManager.invalidate(CACHE_KEYS.EMAIL_DETAIL(emailId));
    cacheManager.invalidatePrefix(CACHE_KEYS.INBOX);
    cacheManager.invalidatePrefix(CACHE_KEYS.READ_LATER);
    cacheManager.invalidatePrefix(CACHE_KEYS.FAVORITES);
    cacheManager.invalidatePrefix(CACHE_KEYS.TRASH);
  }

  /**
   * Permanently delete an email
   */
  async deleteEmail(emailId: string): Promise<void> {
    console.debug(`🗑️ Permanently deleting email: ${emailId}`);
    await apiClient.delete(`/api/email/${emailId}/delete/`);
    // Invalidate all caches since email deleted
    cacheManager.invalidate(CACHE_KEYS.EMAIL_DETAIL(emailId));
    cacheManager.invalidatePrefix(CACHE_KEYS.INBOX);
    cacheManager.invalidatePrefix(CACHE_KEYS.TRASH);
  }

  /**
   * Restore an email from trash back to inbox
   */
  async restoreFromTrash(emailId: string): Promise<void> {
    console.debug(`♻️ Restoring email from trash: ${emailId}`);
    await apiClient.patch(`/api/email/${emailId}/restore/`);
    // Invalidate all caches since email moved
    cacheManager.invalidate(CACHE_KEYS.EMAIL_DETAIL(emailId));
    cacheManager.invalidatePrefix(CACHE_KEYS.INBOX);
    cacheManager.invalidatePrefix(CACHE_KEYS.TRASH);
  }

  /**
   * Move email to a specific folder
   */
  async moveToFolder(emailId: string, folderName: string): Promise<void> {
    console.debug(`📁 Moving email ${emailId} to folder: ${folderName}`);
    await apiClient.patch(`/api/email/${emailId}/move/${folderName}/`);
    cacheManager.invalidate(CACHE_KEYS.EMAIL_DETAIL(emailId));
    cacheManager.invalidatePrefix(CACHE_KEYS.INBOX);
  }

  /**
   * Toggle public sharing for an email
   */
  async toggleShare(emailId: string, isShared: boolean): Promise<{ shareUrl?: string }> {
    console.debug(`🔗 Toggling share for email ${emailId}: ${isShared}`);
    const response = await apiClient.patch(`/api/email/${emailId}/toggle-share/`, {
      isShared
    });
    cacheManager.invalidate(CACHE_KEYS.EMAIL_DETAIL(emailId));
    return response.data;
  }

  /**
   * Generate AI summary for an email (streaming)
   */
  async generateSummary(emailId: string): Promise<string> {
    console.debug(`🤖 Generating AI summary for email: ${emailId}`);
    const response = await apiClient.post(`/api/email/${emailId}/summary/`);
    return response.data?.summary || '';
  }

  /**
   * Get email details by ID
   * Uses caching with longer TTL since email content rarely changes
   */
  async getEmailDetail(emailId: string, forceRefresh: boolean = false): Promise<EmailDetail> {
    const cacheKey = CACHE_KEYS.EMAIL_DETAIL(emailId);

    return cacheManager.fetchWithCache(
      cacheKey,
      async () => {
        const response = await apiClient.get<EmailDetailApi>(
          `/api/email/${emailId}/`
        );
        return normalizeEmailDetail(response.data);
      },
      {
        ttl: CACHE_TTL.LONG,  // 10 minutes for email details
        persist: true,        // Persist to localStorage for offline reading
        forceRefresh,
        staleWhileRevalidate: false,  // Email content should be fresh
      }
    );
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
    // Invalidate the email detail cache since highlights changed
    cacheManager.invalidate(CACHE_KEYS.EMAIL_DETAIL(emailId));
    return response.data;
  }

  /**
   * Delete a highlight from an email
   */
  async deleteHighlight(emailId: string, highlightId: string): Promise<void> {
    console.debug(`🗑️ Deleting highlight ${highlightId} from email: ${emailId}`);
    await apiClient.delete(`/api/email/${emailId}/highlight/${highlightId}/`);
    cacheManager.invalidate(CACHE_KEYS.EMAIL_DETAIL(emailId));
  }

  /**
   * Add or update a note on a highlight
   */
  async updateHighlightNote(emailId: string, highlightId: string, note: string): Promise<any> {
    console.debug(`📝 Updating note for highlight ${highlightId}: ${note.substring(0, 20)}...`);
    const response = await apiClient.patch(`/api/email/${emailId}/highlight/${highlightId}/note/`, {
      note
    });
    cacheManager.invalidate(CACHE_KEYS.EMAIL_DETAIL(emailId));
    return response.data;
  }

  /**
   * Get all highlights for current user (across all emails)
   */
  async getAllHighlights(): Promise<any[]> {
    const cacheKey = 'all_highlights';
    
    return cacheManager.fetchWithCache(
      cacheKey,
      async () => {
        const response = await apiClient.get('/api/user/all-highlights/');
        // API returns { data: [...] } structure
        const responseData = response.data?.data ?? response.data?.highlights ?? response.data ?? [];
        return Array.isArray(responseData) ? responseData : [];
      },
      {
        ttl: CACHE_TTL.MEDIUM,
        persist: false,
        staleWhileRevalidate: true,
      }
    );
  }

  /**
   * Invalidate all inbox-related caches (useful for manual refresh)
   */
  invalidateInboxCache(): void {
    cacheManager.invalidatePrefix(CACHE_KEYS.INBOX);
  }

  /**
   * Invalidate all caches (useful for logout or major data changes)
   */
  invalidateAllCaches(): void {
    cacheManager.invalidateAll();
  }
}

export default new EmailService();

