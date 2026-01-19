"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import EmptyList from "@/components/inbox/EmptyList";
import EmptyInbox from "@/components/inbox/EmptyInbox";
import NewsletterCard from "@/components/inbox/InboxCard";
import FilterButton from "@/components/FilterButton";
import RefreshButton from "@/components/inbox/RefreshButton";
import TabSwitcher from "@/components/inbox/TabSwitcher";
import MobileInboxSection from "./MobileInboxSection";
import EmptyState from "@/components/SearchNotFound";
import emailService, { extractNewsletterName, extractFirstImage, cleanContentPreview } from "@/services/email";
import analyticsService from "@/services/analytics";
import type { EmailListItem } from "@/services/email";
import InboxSkeleton from "@/components/inbox/InboxSkeleton";
import EmailBubble from "@/components/EmailBubble";
import FlameBadge from "@/components/FlameBadge";
import ThemeToggle from "@/components/ThemeToggle";

/* --------------------- EMAIL TRANSFORMATION --------------------- */
function transformEmailToCard(email: EmailListItem) {
  const dateReceived = email.dateReceived ? new Date(email.dateReceived) : new Date();
  const now = new Date();
  const diffMs = now.getTime() - dateReceived.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  let timeDisplay = "Just now";
  if (diffDays > 0) {
    timeDisplay = `${diffDays}d ago`;
  } else if (diffHours > 0) {
    timeDisplay = `${diffHours}h ago`;
  } else if (diffMinutes > 0) {
    timeDisplay = `${diffMinutes} min${diffMinutes > 1 ? 's' : ''}`;
  }

  const newsletterName = email.newsletterName || extractNewsletterName(email.sender);
  const extractedImage = email.firstImage || extractFirstImage(email.contentPreview || null);
  const thumbnail = extractedImage || null;

  const day = dateReceived.getDate();
  const month = dateReceived.toLocaleDateString("en-US", { month: "short" });
  const daySuffix = day === 1 || day === 21 || day === 31 ? 'st' :
    day === 2 || day === 22 ? 'nd' :
      day === 3 || day === 23 ? 'rd' : 'th';
  const dateStr = `${month} ${day}${daySuffix}`;

  return {
    badgeText: newsletterName,
    badgeColor: "#E0F2FE",
    badgeTextColor: "#0369A1",
    author: newsletterName,
    title: email.subject || "No Subject",
    description: cleanContentPreview(email.contentPreview),
    date: dateStr,
    time: timeDisplay,
    tag: "Email",
    thumbnail: thumbnail,
    read: email.isRead,
    slug: email.id,
    emailId: email.id,
    isFavorite: email.isFavorite,
    isReadLater: email.isReadLater,
    wordsCount: email.wordsCount,
    newsletterName: newsletterName,
    newsletterLogo: email.newsletterLogo,
    sender: email.sender,
    dateReceived: email.dateReceived,
  };
}

/* --------------------- CONSTANTS --------------------- */
const EMAILS_PER_PAGE = 20;
const INITIAL_PAGES_TO_FETCH = 10; // Fetch 10 pages (200 emails) initially for good coverage
const BACKGROUND_BATCH_SIZE = 5; // Fetch 5 pages per background batch (100 emails)
const BACKGROUND_FETCH_DELAY = 200; // 200ms delay between background batches (faster)
const INITIAL_VISIBLE_PER_SECTION = 10; // Show 10 emails initially per section
const LOAD_MORE_COUNT = 10; // Show 10 more when clicking view more
const REQUEST_TIMEOUT_MS = 60000; // 60 second timeout
const MAX_PAGES = 1000; // Max 1000 pages (20,000 emails)

async function withTimeout<T>(promise: Promise<T>, label: string, timeoutMs = REQUEST_TIMEOUT_MS): Promise<T> {
  return await Promise.race([
    promise,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error(`${label} timed out`)), timeoutMs)),
  ]);
}

/* ---------------------------------------------------------------- */
/* PERSISTENT INBOX CACHE - survives component remounts */
/* ---------------------------------------------------------------- */
interface InboxCache {
  unread: { emails: any[]; nextPage: number; hasMore: boolean; timestamp: number };
  read: { emails: any[]; nextPage: number; hasMore: boolean; timestamp: number };
  all: { emails: any[]; nextPage: number; hasMore: boolean; timestamp: number };
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache validity

// Global cache outside React - persists across component remounts
let inboxCache: InboxCache = {
  unread: { emails: [], nextPage: 1, hasMore: true, timestamp: 0 },
  read: { emails: [], nextPage: 1, hasMore: true, timestamp: 0 },
  all: { emails: [], nextPage: 1, hasMore: true, timestamp: 0 },
};

function getCachedInbox(tab: 'unread' | 'read' | 'all'): { emails: any[]; nextPage: number; hasMore: boolean } | null {
  const cached = inboxCache[tab];
  const now = Date.now();
  if (cached.emails.length > 0 && (now - cached.timestamp) < CACHE_TTL) {
    console.log(`✅ Using cached ${tab} inbox: ${cached.emails.length} emails`);
    return { emails: cached.emails, nextPage: cached.nextPage, hasMore: cached.hasMore };
  }
  return null;
}

function setCachedInbox(tab: 'unread' | 'read' | 'all', emails: any[], nextPage: number, hasMore: boolean) {
  inboxCache[tab] = { emails, nextPage, hasMore, timestamp: Date.now() };
}

function updateCachedEmail(emailId: string, updates: Partial<any>) {
  (['unread', 'read', 'all'] as const).forEach(tab => {
    inboxCache[tab].emails = inboxCache[tab].emails.map(e => 
      e.emailId === emailId ? { ...e, ...updates } : e
    );
  });
}

/* ---------------------------------------------------------------- */

export default function InboxPage() {
  const { t } = useTranslation("common");
  const router = useRouter();
  const [tab, setTab] = useState<"unread" | "read" | "all">("unread");
  
  // Initialize from cache if available
  const cachedData = getCachedInbox(tab);
  const [initialLoading, setInitialLoading] = useState(!cachedData);
  const [backgroundLoading, setBackgroundLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // All fetched emails (single source of truth) - initialize from cache
  const [allEmails, setAllEmails] = useState<any[]>(cachedData?.emails || []);

  // Pagination tracking - initialize from cache
  const [nextPageToFetch, setNextPageToFetch] = useState(cachedData?.nextPage || 1);
  const [hasMorePages, setHasMorePages] = useState(cachedData?.hasMore ?? true);
  const [realUnreadCount, setRealUnreadCount] = useState(0);
  const [realReadCount, setRealReadCount] = useState(0); // Real read count from analytics
  const [totalEmailsFromAPI, setTotalEmailsFromAPI] = useState(0); // Real total from analytics
  
  // Background fetch control
  const backgroundFetchRef = useRef<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const currentTabRef = useRef<string>(tab); // Track current tab to detect real tab changes
  const isMountedRef = useRef<boolean>(true); // Track if component is mounted
  const hasInitializedRef = useRef<boolean>(!!cachedData); // Track if we've already initialized

  // UI visibility controls (how many to show in each section)
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_PER_SECTION); // Start with 10 visible total

  /**
   * Merge emails with deduplication by ID
   */
  const mergeEmails = useCallback((existing: any[], newEmails: any[]): any[] => {
    const emailMap = new Map<string, any>();
    existing.forEach(email => emailMap.set(email.emailId, email));
    newEmails.forEach(email => emailMap.set(email.emailId, email));
    return Array.from(emailMap.values());
  }, []);

  /**
   * Fetch a single page of emails - use cache when available
   */
  const fetchPage = useCallback(async (page: number, isReadParam: boolean | undefined, forceRefresh: boolean = false): Promise<EmailListItem[]> => {
    try {
      // Use forceRefresh=false to leverage cache on navigation back
      const response = await emailService.getInboxEmails("latest", isReadParam, page, forceRefresh);
      
      if (!Array.isArray(response) || response.length === 0) return [];
      
      // Check if it's an empty inbox response
      const firstItem = response[0] as any;
      if ('pendingNewsletters' in firstItem) return [];
      
      return response as EmailListItem[];
    } catch (err) {
      console.error(`Failed to fetch page ${page}:`, err);
      return [];
    }
  }, []);

  /**
   * Fetch multiple pages in parallel - use cache by default
   */
  const fetchPages = useCallback(async (startPage: number, count: number, isReadParam: boolean | undefined, forceRefresh: boolean = false): Promise<{emails: EmailListItem[], lastPage: number, hasMore: boolean}> => {
    const pagePromises = [];
    for (let i = 0; i < count; i++) {
      pagePromises.push(fetchPage(startPage + i, isReadParam, forceRefresh));
    }
    
    const results = await Promise.all(pagePromises);
    const allFetched: EmailListItem[] = [];
    let lastPageWithData = startPage - 1;
    
    for (let i = 0; i < results.length; i++) {
      if (results[i].length > 0) {
        allFetched.push(...results[i]);
        lastPageWithData = startPage + i;
      }
    }
    
    // If any page returned less than full page size, we might be near the end
    const hasMore = results[results.length - 1]?.length === EMAILS_PER_PAGE;
    
    return { emails: allFetched, lastPage: lastPageWithData, hasMore };
  }, [fetchPage]);

  /**
   * Background fetch loop - continues fetching pages until no more data
   */
  const startBackgroundFetch = useCallback(async (startPage: number, isReadParam: boolean | undefined) => {
    if (backgroundFetchRef.current) {
      console.log('⚠️ Background fetch already running, skipping');
      return; // Already running
    }
    
    backgroundFetchRef.current = true;
    setBackgroundLoading(true);
    
    let currentPage = startPage;
    let consecutiveEmptyPages = 0;
    
    console.log(`🚀 Background fetch starting from page ${startPage}`);
    
    while (backgroundFetchRef.current && currentPage < MAX_PAGES) { // Fetch until no more data
      try {
        console.log(`📥 Background fetching pages ${currentPage} to ${currentPage + BACKGROUND_BATCH_SIZE - 1}`);
        
        const { emails, lastPage, hasMore } = await fetchPages(currentPage, BACKGROUND_BATCH_SIZE, isReadParam);
        
        console.log(`📨 Got ${emails.length} emails from pages ${currentPage}-${lastPage}, hasMore=${hasMore}`);
        
        if (emails.length === 0) {
          consecutiveEmptyPages++;
          if (consecutiveEmptyPages >= 2) {
            console.log('⏹️ Two consecutive empty batches, stopping');
            setHasMorePages(false);
            break;
          }
          // Try next batch
          currentPage = lastPage + 1;
          continue;
        }
        
        consecutiveEmptyPages = 0; // Reset counter
        
        // Transform and merge
        const transformed = emails.map(transformEmailToCard);
        setAllEmails(prev => {
          const merged = mergeEmails(prev, transformed);
          console.log(`📊 Total emails after merge: ${merged.length}`);
          // Update cache with merged data
          const currentTab = currentTabRef.current as 'unread' | 'read' | 'all';
          setCachedInbox(currentTab, merged, currentPage + 1, hasMore);
          return merged;
        });
        
        currentPage = lastPage + 1;
        setNextPageToFetch(currentPage);
        
        if (!hasMore) {
          console.log('⏹️ No more pages indicated by API');
          setHasMorePages(false);
          break;
        }
        
        // Small delay to prevent overwhelming the API
        await new Promise(resolve => setTimeout(resolve, BACKGROUND_FETCH_DELAY));
        
      } catch (err) {
        console.error('Background fetch error:', err);
        break;
      }
    }
    
    console.log(`✅ Background fetch complete, stopped at page ${currentPage}`);
    backgroundFetchRef.current = false;
    setBackgroundLoading(false);
  }, [fetchPages, mergeEmails]);

  /**
   * Stop background fetching
   */
  const stopBackgroundFetch = useCallback(() => {
    backgroundFetchRef.current = false;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  /**
   * Compute grouped emails using useMemo
   * Always sorted by date (newest first) within each group
   */
  const { todayEmails, last7DaysEmails, last30DaysEmails, olderEmails, sortedAllEmails } = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Sort ALL emails by date first (newest first)
    const sorted = [...allEmails].sort((a, b) => {
      const dateA = a.dateReceived ? new Date(a.dateReceived).getTime() : 0;
      const dateB = b.dateReceived ? new Date(b.dateReceived).getTime() : 0;
      return dateB - dateA; // Newest first
    });

    // Debug: log first 3 emails with dates
    if (sorted.length > 0) {
      console.log('🔍 First 3 emails after sort:', sorted.slice(0, 3).map(e => ({
        subject: e.title?.substring(0, 30),
        dateReceived: e.dateReceived,
        parsed: e.dateReceived ? new Date(e.dateReceived).toISOString() : 'none'
      })));
    }

    const today: any[] = [];
    const last7Days: any[] = [];
    const last30Days: any[] = [];
    const older: any[] = [];

    sorted.forEach((email) => {
      const dateReceived = email.dateReceived ? new Date(email.dateReceived) : null;
      if (!dateReceived || isNaN(dateReceived.getTime())) {
        older.push(email);
        return;
      }

      if (dateReceived >= todayStart) {
        today.push(email);
      } else if (dateReceived >= sevenDaysAgo) {
        last7Days.push(email);
      } else if (dateReceived >= thirtyDaysAgo) {
        last30Days.push(email);
      } else {
        older.push(email);
      }
    });

    console.log(`📊 Grouped: Today=${today.length}, 7Days=${last7Days.length}, 30Days=${last30Days.length}, Older=${older.length}, Total=${sorted.length}`);
    console.log(`📅 Date thresholds: todayStart=${todayStart.toISOString()}, 7daysAgo=${sevenDaysAgo.toISOString()}, 30daysAgo=${thirtyDaysAgo.toISOString()}`);

    return { 
      todayEmails: today, 
      last7DaysEmails: last7Days, 
      last30DaysEmails: last30Days, 
      olderEmails: older,
      sortedAllEmails: sorted
    };
  }, [allEmails]);

  /**
   * Get visible emails based on visibleCount
   * Prioritizes: Today -> Last 7 Days -> Last 30 Days -> Older
   */
  const visibleEmails = useMemo(() => {
    let remaining = visibleCount;
    
    const visibleToday = todayEmails.slice(0, remaining);
    remaining -= visibleToday.length;
    
    const visible7Days = remaining > 0 ? last7DaysEmails.slice(0, remaining) : [];
    remaining -= visible7Days.length;
    
    const visible30Days = remaining > 0 ? last30DaysEmails.slice(0, remaining) : [];
    remaining -= visible30Days.length;
    
    const visibleOlder = remaining > 0 ? olderEmails.slice(0, remaining) : [];
    
    return {
      today: visibleToday,
      last7Days: visible7Days,
      last30Days: visible30Days,
      older: visibleOlder
    };
  }, [todayEmails, last7DaysEmails, last30DaysEmails, olderEmails, visibleCount]);

  // Fetch unread count and total from API
  const fetchUnreadCount = useCallback(async () => {
    try {
      const snapshot = await analyticsService.getInboxSnapshot();
      setRealUnreadCount(snapshot.unread);
      setRealReadCount(snapshot.read); // Store real read count from API
      // Set total emails from API (unread + read gives us total)
      const total = (snapshot.unread || 0) + (snapshot.read || 0);
      setTotalEmailsFromAPI(total);
      console.log(`📊 API Total: unread=${snapshot.unread}, read=${snapshot.read}, total=${total}`);
    } catch (e) {
      console.warn("Failed to fetch unread count", e);
    }
  }, []);

  /**
   * Initial data fetch + start background loading
   */
  useEffect(() => {
    const isReadParam = tab === "unread" ? false : tab === "read" ? true : undefined;
    
    // Check if tab actually changed (to avoid React Strict Mode double-run issues)
    const tabActuallyChanged = currentTabRef.current !== tab;
    currentTabRef.current = tab;
    
    // Check cache first - if we have valid cached data, use it immediately
    const cached = getCachedInbox(tab);
    if (cached && cached.emails.length > 0 && !tabActuallyChanged) {
      console.log(`✅ Using cached data for ${tab}: ${cached.emails.length} emails, skipping fetch`);
      setAllEmails(cached.emails);
      setNextPageToFetch(cached.nextPage);
      setHasMorePages(cached.hasMore);
      setInitialLoading(false);
      fetchUnreadCount(); // Still refresh counts
      return;
    }
    
    // Only stop background fetch if tab actually changed
    if (tabActuallyChanged) {
      console.log(`🔄 Tab changed to: ${tab}, stopping existing background fetch`);
      stopBackgroundFetch();
      
      // Check cache for the new tab
      const tabCache = getCachedInbox(tab);
      if (tabCache && tabCache.emails.length > 0) {
        console.log(`✅ Switching to cached ${tab} tab: ${tabCache.emails.length} emails`);
        setAllEmails(tabCache.emails);
        setNextPageToFetch(tabCache.nextPage);
        setHasMorePages(tabCache.hasMore);
        setInitialLoading(false);
        setVisibleCount(INITIAL_VISIBLE_PER_SECTION * 4);
        fetchUnreadCount();
        return;
      }
    }
    
    // Reset state - we need to fetch
    setAllEmails([]);
    setNextPageToFetch(1);
    setHasMorePages(true);
    setVisibleCount(INITIAL_VISIBLE_PER_SECTION * 4);
    setError(null);
    
    const loadInitialData = async () => {
      setInitialLoading(true);
      
      try {
        // Fetch unread count
        fetchUnreadCount();
        
        // Fetch first batch of pages for fast first paint
        // Use cache (forceRefresh=false) when navigating back
        console.log(`🔄 Fetching initial ${INITIAL_PAGES_TO_FETCH} pages for tab: ${tab} (using cache)`);
        
        const { emails, lastPage, hasMore } = await withTimeout(
          fetchPages(1, INITIAL_PAGES_TO_FETCH, isReadParam, false), // Use cache
          "Initial inbox fetch"
        );
        
        if (emails.length === 0) {
          setAllEmails([]);
          setHasMorePages(false);
          setCachedInbox(tab, [], 1, false); // Cache empty result
        } else {
          const transformed = emails.map(transformEmailToCard);
          setAllEmails(transformed);
          setNextPageToFetch(lastPage + 1);
          setHasMorePages(hasMore);
          
          // Save to persistent cache for instant restore on navigation back
          setCachedInbox(tab, transformed, lastPage + 1, hasMore);
          
          console.log(`📊 Initial load: ${emails.length} emails, lastPage=${lastPage}, hasMore=${hasMore}`);
          
          // Start background fetch for remaining pages
          if (hasMore) {
            console.log(`🔄 Starting background fetch from page ${lastPage + 1}`);
            // Use setTimeout to ensure state is settled before background fetch
            setTimeout(() => {
              startBackgroundFetch(lastPage + 1, isReadParam);
            }, 100);
          } else {
            console.log('⚠️ hasMore is false, not starting background fetch');
          }
        }
      } catch (err: any) {
        console.error('Failed to fetch initial emails:', err);
        setError(err.message || 'Failed to load emails');
      } finally {
        setInitialLoading(false);
      }
    };
    
    loadInitialData();
    
    // Cleanup function - save current state to cache before unmount
    return () => {
      // Cache is already updated incrementally, no action needed
    };
  }, [tab, fetchPages, fetchUnreadCount, startBackgroundFetch, stopBackgroundFetch]);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      console.log('🧹 Component unmounting, stopping background fetch');
      stopBackgroundFetch();
    };
  }, [stopBackgroundFetch]);

  // Handle window focus and visibility - only refresh counts, not full list (to avoid reload UX)
  useEffect(() => {
    const handleFocus = () => {
      console.log('🔄 Window focused - refreshing counts only');
      fetchUnreadCount();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('🔄 Page visible again - refreshing counts only');
        fetchUnreadCount();
        // Don't reload emails automatically - let user pull to refresh if they want fresh data
      }
    };

    const handleEmailStatusChange = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { emailId, isRead } = customEvent.detail;
      console.log(`📧 Email status changed: ${emailId} -> read=${isRead}`);
      
      setAllEmails(prev => {
        const updated = prev.map(e => e.emailId === emailId ? { ...e, read: isRead } : e);
        // If on unread tab and email is now read, filter it out
        if (tab === "unread" && isRead) {
          return updated.filter(e => e.emailId !== emailId);
        }
        // If on read tab and email is now unread, filter it out
        if (tab === "read" && !isRead) {
          return updated.filter(e => e.emailId !== emailId);
        }
        return updated;
      });
      fetchUnreadCount();
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('emailStatusChanged', handleEmailStatusChange);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('emailStatusChanged', handleEmailStatusChange);
    };
  }, [fetchUnreadCount, tab, fetchPage]);

  /* ---------------- UI HANDLERS ---------------- */
  
  const loadMoreVisible = () => {
    setVisibleCount(prev => prev + LOAD_MORE_COUNT);
  };

  const refreshInbox = async () => {
    setInitialLoading(true);
    try {
      // Stop any ongoing background fetch
      stopBackgroundFetch();
      
      // Clear cache and reset state
      inboxCache.unread = { emails: [], nextPage: 1, hasMore: true, timestamp: 0 };
      inboxCache.read = { emails: [], nextPage: 1, hasMore: true, timestamp: 0 };
      inboxCache.all = { emails: [], nextPage: 1, hasMore: true, timestamp: 0 };
      
      setAllEmails([]);
      setVisibleCount(INITIAL_VISIBLE_PER_SECTION);
      setNextPageToFetch(1);
      setHasMorePages(true);
      
      // Determine isRead parameter based on current tab
      const isReadParam = tab === 'unread' ? false : tab === 'read' ? true : undefined;
      
      // Fetch fresh emails (force refresh)
      const { emails, lastPage, hasMore } = await withTimeout(
        fetchPages(1, INITIAL_PAGES_TO_FETCH, isReadParam, true), // Force refresh
        "Refresh inbox fetch"
      );
      
      if (emails.length === 0) {
        setAllEmails([]);
        setHasMorePages(false);
        setCachedInbox(tab, [], 1, false);
      } else {
        const transformed = emails.map(transformEmailToCard);
        setAllEmails(transformed);
        setNextPageToFetch(lastPage + 1);
        setHasMorePages(hasMore);
        setCachedInbox(tab, transformed, lastPage + 1, hasMore);
        
        // Start background fetch for remaining pages
        if (hasMore) {
          setTimeout(() => {
            startBackgroundFetch(lastPage + 1, isReadParam);
          }, 100);
        }
      }
      
      // Fetch updated unread count
      fetchUnreadCount();
      
      toast.success('Inbox refreshed', {
        description: 'Fetched latest emails'
      });
    } catch (error) {
      console.error('Failed to refresh inbox:', error);
      toast.error('Failed to refresh', {
        description: 'Please try again'
      });
    } finally {
      setInitialLoading(false);
    }
  };

  const onMoveToTrash = async (emailId: string) => {
    try {
      await emailService.moveToTrash(emailId);
      setAllEmails(prev => prev.filter(e => e.emailId !== emailId));
      
      toast.success('Moved to trash', {
        description: 'Email has been moved to trash',
        action: {
          label: 'View',
          onClick: () => router.push('/delete'),
        },
      });
    } catch (err) {
      console.error("Failed to move to trash", err);
      toast.error('Failed to move to trash');
    }
  };

  const onToggleReadLater = async (emailId: string, isReadLater: boolean) => {
    try {
      await emailService.toggleReadLater(emailId, isReadLater);
      setAllEmails(prev => prev.map(e =>
        e.emailId === emailId ? { ...e, isReadLater } : e
      ));
      
      if (isReadLater) {
        toast.success('Added to Read Later', {
          description: 'Email saved for later reading',
          action: {
            label: 'View',
            onClick: () => router.push('/read_later'),
          },
        });
      } else {
        toast.success('Removed from Read Later');
      }
    } catch (err) {
      console.error("Failed to toggle read later", err);
      toast.error('Failed to update read later');
    }
  };

  const onToggleFavorite = async (emailId: string, isFavorite: boolean) => {
    try {
      await emailService.toggleFavorite(emailId, isFavorite);
      setAllEmails(prev => prev.map(e =>
        e.emailId === emailId ? { ...e, isFavorite } : e
      ));
      
      if (isFavorite) {
        toast.success('Added to Favorites', {
          description: 'Email marked as favorite',
          action: {
            label: 'View',
            onClick: () => router.push('/favorite'),
          },
        });
      } else {
        toast.success('Removed from Favorites');
      }
    } catch (err) {
      console.error("Failed to toggle favorite", err);
      toast.error('Failed to update favorite');
    }
  };

  /* ---------------- COMPUTED VALUES ---------------- */
  
  const unreadCountForSwitcher = realUnreadCount || allEmails.filter(i => !i.read).length;
  const readCountForSwitcher = realReadCount || allEmails.filter(i => i.read).length;
  const allCountForSwitcher = totalEmailsFromAPI || allEmails.length;

  const totalEmailsCount = sortedAllEmails.length;
  const visibleEmailsCount = visibleEmails.today.length + visibleEmails.last7Days.length + 
                             visibleEmails.last30Days.length + visibleEmails.older.length;
  
  // Use API total for display, fallback to fetched count
  const displayTotalCount = tab === "unread" 
    ? (realUnreadCount || totalEmailsCount)
    : tab === "read" 
      ? (totalEmailsFromAPI - realUnreadCount || totalEmailsCount)
      : (totalEmailsFromAPI || totalEmailsCount);
  
  const hasMoreToShow = visibleEmailsCount < totalEmailsCount || hasMorePages || visibleEmailsCount < displayTotalCount;
  
  const allEmpty = todayEmails.length === 0 && last7DaysEmails.length === 0 && 
                   last30DaysEmails.length === 0 && olderEmails.length === 0;

  return (
    <>
      {/* Loading state */}
      {initialLoading && <InboxSkeleton />}

      {/* Error state */}
      {error && !initialLoading && (
        <div className="w-full p-6 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
          <button
            onClick={refreshInbox}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Content */}
      {!initialLoading && !error && (
        <>
          {/* Background loading indicator */}
          {backgroundLoading && (
            <div className="fixed top-4 right-4 z-50 bg-blue-500 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2 shadow-lg">
              <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
              Loading more...
            </div>
          )}

          {/* MOBILE RENDER */}
          <MobileInboxSection
            tab={tab}
            setTab={setTab}
            filteredToday={visibleEmails.today}
            filtered7Days={visibleEmails.last7Days}
            filtered30Days={visibleEmails.last30Days}
            filteredOlder={visibleEmails.older}
            unreadCount={unreadCountForSwitcher}
            readCount={readCountForSwitcher}
            allCount={allCountForSwitcher}
            hasMorePages={hasMoreToShow}
            loadingMore={backgroundLoading}
            onRequestMore={loadMoreVisible}
            onMoveToTrash={onMoveToTrash}
            onToggleReadLater={onToggleReadLater}
            onToggleFavorite={onToggleFavorite}
          />

          {/* DESKTOP RENDER */}
          <div className="hidden md:flex w-full flex-col h-full">
            {/* HEADER - Sticky */}
            <div className="w-full sticky top-0 z-50 bg-white">
              <div className="w-full h-[78px] bg-white border border-[#E5E7E8] flex items-center justify-between px-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <h2 className="text-[26px] font-bold text-[#0C1014]">
                    {t("inbox.title")}
                  </h2>
                  <RefreshButton onClick={refreshInbox} />
                  {backgroundLoading && (
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <div className="animate-spin rounded-full h-3 w-3 border-2 border-gray-400 border-t-transparent"></div>
                      syncing...
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 px-4 shrink-0">
                  <TabSwitcher
                    tab={tab}
                    setTab={setTab}
                    unreadCount={unreadCountForSwitcher}
                    readCount={readCountForSwitcher}
                    allCount={allCountForSwitcher}
                  />
                </div>
              </div>
            </div>

            {/* CONTENT - Scrollable */}
            <div className="w-full flex flex-col gap-10 mt-6 px-6 overflow-y-auto flex-1">
              {allEmpty && <EmptyInbox />}

              {/* TODAY */}
              {visibleEmails.today.length > 0 && (
                <section>
                  <h3 className="text-[18px] font-semibold text-[#6F7680] mb-4">
                    {t("time.today")}
                  </h3>
                  {visibleEmails.today.map((item) => (
                    <div key={item.emailId} className="mb-2">
                      <NewsletterCard
                        {...item}
                        onMoveToTrash={onMoveToTrash}
                        onToggleReadLater={onToggleReadLater}
                        onToggleFavorite={onToggleFavorite}
                        isFavorite={item.isFavorite}
                      />
                    </div>
                  ))}
                </section>
              )}

              {/* LAST 7 DAYS */}
              {visibleEmails.last7Days.length > 0 && (
                <section>
                  <h3 className="text-[18px] font-semibold text-[#6F7680] mb-4">
                    {t("time.last7Days", "Last 7 days")}
                  </h3>
                  {visibleEmails.last7Days.map((item) => (
                    <div key={item.emailId} className="mb-2">
                      <NewsletterCard
                        {...item}
                        onMoveToTrash={onMoveToTrash}
                        onToggleReadLater={onToggleReadLater}
                        onToggleFavorite={onToggleFavorite}
                        isFavorite={item.isFavorite}
                      />
                    </div>
                  ))}
                </section>
              )}

              {/* LAST 30 DAYS */}
              {visibleEmails.last30Days.length > 0 && (
                <section>
                  <h3 className="text-[18px] font-semibold text-[#6F7680] mb-4">
                    {t("time.last30Days", "Last 30 days")}
                  </h3>
                  {visibleEmails.last30Days.map((item) => (
                    <div key={item.emailId} className="mb-2">
                      <NewsletterCard
                        {...item}
                        onMoveToTrash={onMoveToTrash}
                        onToggleReadLater={onToggleReadLater}
                        onToggleFavorite={onToggleFavorite}
                        isFavorite={item.isFavorite}
                      />
                    </div>
                  ))}
                </section>
              )}

              {/* OLDER */}
              {visibleEmails.older.length > 0 && (
                <section>
                  <h3 className="text-[18px] font-semibold text-[#6F7680] mb-4">
                    {t("time.older", "Older")}
                  </h3>
                  {visibleEmails.older.map((item) => (
                    <div key={item.emailId} className="mb-2">
                      <NewsletterCard
                        {...item}
                        onMoveToTrash={onMoveToTrash}
                        onToggleReadLater={onToggleReadLater}
                        onToggleFavorite={onToggleFavorite}
                        isFavorite={item.isFavorite}
                      />
                    </div>
                  ))}
                </section>
              )}

              {/* VIEW MORE BUTTON */}
              {hasMoreToShow && (
                <div className="w-full flex justify-center mt-8 pb-12">
                  <button
                    onClick={loadMoreVisible}
                    className="px-8 py-3 border border-gray-300 rounded-full text-black font-medium hover:bg-gray-50 transition shadow-sm"
                  >
                    {t("common.viewMore")} ({visibleEmailsCount} of {displayTotalCount.toLocaleString()}{backgroundLoading ? '+' : ''})
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
