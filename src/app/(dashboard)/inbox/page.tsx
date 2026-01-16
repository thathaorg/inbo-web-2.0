"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import EmptyList from "@/components/inbox/EmptyList";
import EmptyInbox from "@/components/inbox/EmptyInbox";
import NewsletterCard from "@/components/inbox/InboxCard";
import FilterButton from "@/components/FilterButton";
import RefreshButton from "@/components/inbox/RefreshButton";
import TabSwitcher from "@/components/inbox/TabSwitcher";
import MobileInboxSection from "./MobileInboxSection";
import EmptyState from "@/components/SearchNotFound";
import emailService, { extractNewsletterName, extractFirstImage } from "@/services/email";
import analyticsService from "@/services/analytics";
import type { EmailListItem } from "@/services/email";
import InboxSkeleton from "@/components/inbox/InboxSkeleton";
import EmailBubble from "@/components/EmailBubble";
import FlameBadge from "@/components/FlameBadge";
import ThemeToggle from "@/components/ThemeToggle";

/* --------------------- EMAIL TRANSFORMATION --------------------- */
/**
 * Transform API EmailListItem to component-compatible format
 */
function transformEmailToCard(email: EmailListItem) {
  const dateReceived = email.dateReceived ? new Date(email.dateReceived) : new Date();
  const now = new Date();
  const diffMs = now.getTime() - dateReceived.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  // Calculate human-readable time (matching Figma: "2 mins")
  let timeDisplay = "Just now";
  if (diffDays > 0) {
    timeDisplay = `${diffDays}d ago`;
  } else if (diffHours > 0) {
    timeDisplay = `${diffHours}h ago`;
  } else if (diffMinutes > 0) {
    timeDisplay = `${diffMinutes} min${diffMinutes > 1 ? 's' : ''}`;
  }

  // Extract newsletter name (use provided or extract from sender)
  const newsletterName = email.newsletterName || extractNewsletterName(email.sender);

  // Extract first image from content - only use placeholder if no image found
  const extractedImage = email.firstImage || extractFirstImage(email.contentPreview || null);
  const thumbnail = extractedImage || null; // Don't use placeholder, show no image if none found

  // Format date like "Oct 3rd" (matching Figma)
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
    author: newsletterName, // Use newsletter name instead of sender email
    title: email.subject || "No Subject",
    description: email.contentPreview || "No preview available",
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
    dateReceived: email.dateReceived, // Keep for sorting
  };
}

/* --------------------- PAGINATION CONSTANTS --------------------- */
const EMAILS_PER_API_PAGE = 20; // Backend returns 20 emails per page
const PAGES_TO_LOAD_INITIAL = 1; // Load 1 page initially for fast first paint
const PAGES_TO_LOAD_MORE = 2; // Load 2 pages when loading more
const INITIAL_VISIBLE = 50; // Show 50 emails initially per section
const LOAD_MORE = 50; // Load 50 more when "view more" is clicked
const REQUEST_TIMEOUT_MS = 45000; // 45s timeout (reduced from 60s)

// Small helper to wrap API calls with a timeout so UI can respond
async function withTimeout<T>(promise: Promise<T>, label: string, timeoutMs = REQUEST_TIMEOUT_MS): Promise<T> {
  return await Promise.race([
    promise,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error(`${label} timed out`)), timeoutMs)),
  ]);
}

/* ---------------------------------------------------------------- */

export default function InboxPage() {
  const [tab, setTab] = useState<"unread" | "read" | "all">("unread");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Email groups by time period
  const [todayEmails, setTodayEmails] = useState<any[]>([]);
  const [last7DaysEmails, setLast7DaysEmails] = useState<any[]>([]);
  const [last30DaysEmails, setLast30DaysEmails] = useState<any[]>([]);
  const [olderEmails, setOlderEmails] = useState<any[]>([]);

  // Pagination state
  const [nextPageToFetch, setNextPageToFetch] = useState(1); // Track next API page to fetch
  const [hasMorePages, setHasMorePages] = useState(true);
  const [realUnreadCount, setRealUnreadCount] = useState(0);

  // Reset pagination when tab changes
  useEffect(() => {
    console.log(`📑 Tab changed to: ${tab}`);
    setTodayEmails([]);
    setLast7DaysEmails([]);
    setLast30DaysEmails([]);
    setOlderEmails([]);
    setNextPageToFetch(1);
    setHasMorePages(true);
  }, [tab]);

  // Group emails by time periods
  const groupEmailsByTime = (emails: EmailListItem[]) => {
    const now = new Date();
    // Get midnight today in local timezone
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    // Calculate time boundaries
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const today: any[] = [];
    const last7Days: any[] = [];
    const last30Days: any[] = [];
    const older: any[] = [];

    console.log(`📅 Grouping ${emails.length} emails by time...`);
    console.log(`📅 Now: ${now.toLocaleString()}`);
    console.log(`📅 Today start: ${todayStart.toLocaleString()}`);
    console.log(`📅 7 days ago: ${sevenDaysAgo.toLocaleString()}`);
    console.log(`📅 30 days ago: ${thirtyDaysAgo.toLocaleString()}`);

    emails.forEach((email) => {
      const dateReceived = email.dateReceived ? new Date(email.dateReceived) : null;
      if (!dateReceived) {
        console.log(`⚠️ Email ${email.id} has no dateReceived, placing in Older`);
        older.push(transformEmailToCard(email));
        return;
      }

      // Log first few emails for debugging
      if (today.length + last7Days.length + last30Days.length + older.length < 3) {
        console.log(`📧 Email: ${email.subject?.substring(0, 30)}... | Date: ${dateReceived.toLocaleString()}`);
      }

      // Check if email is from today
      if (dateReceived >= todayStart) {
        today.push(transformEmailToCard(email));
      } else if (dateReceived >= sevenDaysAgo) {
        last7Days.push(transformEmailToCard(email));
      } else if (dateReceived >= thirtyDaysAgo) {
        last30Days.push(transformEmailToCard(email));
      } else {
        older.push(transformEmailToCard(email));
      }
    });

    // Sort each section by date (newest first)
    const sortByDate = (a: any, b: any) => {
      const dateA = new Date(a.dateReceived || 0).getTime();
      const dateB = new Date(b.dateReceived || 0).getTime();
      return dateB - dateA; // Descending (newest first)
    };

    today.sort(sortByDate);
    last7Days.sort(sortByDate);
    last30Days.sort(sortByDate);
    older.sort(sortByDate);

    console.log(`📊 Grouped: Today=${today.length}, Last 7 Days=${last7Days.length}, Last 30 Days=${last30Days.length}, Older=${older.length}`);

    return { today, last7Days, last30Days, older };
  };

  // Fetch unread count independently
  const fetchUnreadCount = async () => {
    try {
      const snapshot = await withTimeout(
        analyticsService.getInboxSnapshot(),
        "Inbox snapshot"
      );
      setRealUnreadCount(snapshot.unread);
    } catch (e) {
      console.warn("Failed to fetch unread count", e);
    }
  };

  // Fetch emails from API
  useEffect(() => {
    fetchUnreadCount(); // update unread count on tab change/refresh

    const fetchEmails = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log(`🔄 Fetching inbox emails [Tab: ${tab}] - Page ${nextPageToFetch}...`);

        // Define isRead filter based on tab
        const isReadParam = tab === "unread" ? false : tab === "read" ? true : undefined;

        // Fetch initial page (single page for faster first paint)
        const pagePromises = [];
        for (let i = 0; i < PAGES_TO_LOAD_INITIAL; i++) {
          const pageNum = nextPageToFetch + i;
          pagePromises.push(emailService.getInboxEmails("latest", isReadParam, pageNum));
        }

        const responses = await withTimeout(
          Promise.all(pagePromises),
          "Inbox emails"
        );
        console.log('📦 Raw API responses:', responses);

        // Combine all responses
        let allEmails: EmailListItem[] = [];
        let hasData = false;

        // Check if response is array of emails or empty response object
        for (const response of responses) {
          if (!Array.isArray(response) || response.length === 0) continue;

          const isEmailArray = (arr: any[]): arr is EmailListItem[] => {
            return arr.length > 0 && 'id' in arr[0];
          };

          if (!isEmailArray(response)) {
            // Empty inbox response
            const emptyResp = response[0] as any;
            console.log('📭 Empty inbox - Pending newsletters:', emptyResp.pendingNewsletters);
            break;
          } else {
            allEmails = [...allEmails, ...response];
            hasData = true;
          }
        }

        if (!hasData || allEmails.length === 0) {
          console.log('📭 No more emails available');
          if (nextPageToFetch === 1) {
            setTodayEmails([]);
            setLast7DaysEmails([]);
            setLast30DaysEmails([]);
            setOlderEmails([]);
          }
          setHasMorePages(false);
        } else {
          // Process emails
          console.log(`📬 Received ${allEmails.length} emails total`);
          const grouped = groupEmailsByTime(allEmails);

          if (nextPageToFetch === 1) {
            // First batch - replace all
            setTodayEmails(grouped.today);
            setLast7DaysEmails(grouped.last7Days);
            setLast30DaysEmails(grouped.last30Days);
            setOlderEmails(grouped.older);
          } else {
            // Subsequent batches - append
            setTodayEmails(prev => [...prev, ...grouped.today]);
            setLast7DaysEmails(prev => [...prev, ...grouped.last7Days]);
            setLast30DaysEmails(prev => [...prev, ...grouped.last30Days]);
            setOlderEmails(prev => [...prev, ...grouped.older]);
          }

          // Only stop pagination when we receive 0 emails
          // Don't stop just because we got less than expected - there might be more!
          setHasMorePages(allEmails.length > 0);

          // Increment page counter for next batch
          setNextPageToFetch(prev => prev + PAGES_TO_LOAD_INITIAL);
        }
      } catch (err: any) {
        console.error('❌ Failed to fetch emails:', err);
        const message = err?.message?.includes('timed out')
          ? 'The server is slow right now (timeout). Please retry in a moment.'
          : err.response?.data?.message || err.message || 'Failed to load emails.';
        setError(message);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };

    fetchEmails();
  }, [tab]); // Fetch when tab changes (nextPageToFetch is managed internally)

  // Refresh when user returns to tab (e.g. after reading)
  useEffect(() => {
    const handleFocus = () => {
      console.log("🪟 Window focused - refreshing unread count...");
      fetchUnreadCount();
      // Optionally refresh first page to see if items moved
      // If we are in "unread" tab, it's very useful to refresh.
      if (tab === "unread") {
        refreshInbox();
      }
    };

    // Listen for email status changes from reading page
    const handleEmailStatusChange = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { emailId, isRead } = customEvent.detail;
      
      console.log(`📧 Email ${emailId} status changed: isRead=${isRead}`);
      
      // Update all email lists to reflect the status change
      const updateLists = (prev: any[]) =>
        prev.map(e =>
          e.emailId === emailId ? { ...e, read: isRead } : e
        );
      
      setTodayEmails(updateLists);
      setLast7DaysEmails(updateLists);
      setLast30DaysEmails(updateLists);
      setOlderEmails(updateLists);
      
      // Refresh unread count
      fetchUnreadCount();
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('emailStatusChanged', handleEmailStatusChange);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('emailStatusChanged', handleEmailStatusChange);
    };
  }, [tab]);

  // Visible counts for each section
  const [visibleToday, setVisibleToday] = useState(INITIAL_VISIBLE);
  const [visible7Days, setVisible7Days] = useState(INITIAL_VISIBLE);
  const [visible30Days, setVisible30Days] = useState(INITIAL_VISIBLE);
  const [visibleOlder, setVisibleOlder] = useState(INITIAL_VISIBLE);

  // Trigger a new batch fetch (3 API pages -> 60 emails)
  const loadNextBatch = async () => {
    if (!hasMorePages || loadingMore) return;
    setLoadingMore(true);

    try {
      const isReadParam = tab === "unread" ? false : tab === "read" ? true : undefined;

      // Fetch next batch of pages
      const pagePromises = [];
      for (let i = 0; i < PAGES_TO_LOAD_MORE; i++) {
        const pageNum = nextPageToFetch + i;
        pagePromises.push(emailService.getInboxEmails("latest", isReadParam, pageNum));
      }

      const responses = await withTimeout(
        Promise.all(pagePromises),
        "Load more emails"
      );

      // Combine responses
      let allEmails: EmailListItem[] = [];
      for (const response of responses) {
        if (!Array.isArray(response) || response.length === 0) continue;

        // Check if it's an empty inbox response
        const firstItem = response[0];
        if ('pendingNewsletters' in firstItem) {
          break;
        }

        // It's a valid email list, add to allEmails
        allEmails = [...allEmails, ...(response as EmailListItem[])];
      }

      if (allEmails.length === 0) {
        setHasMorePages(false);
      } else {
        const grouped = groupEmailsByTime(allEmails);
        setTodayEmails(prev => [...prev, ...grouped.today]);
        setLast7DaysEmails(prev => [...prev, ...grouped.last7Days]);
        setLast30DaysEmails(prev => [...prev, ...grouped.last30Days]);
        setOlderEmails(prev => [...prev, ...grouped.older]);

        // Continue loading as long as we're getting emails
        setHasMorePages(allEmails.length > 0);
        setNextPageToFetch(prev => prev + PAGES_TO_LOAD_MORE);
      }
    } catch (err) {
      console.error('Failed to load more emails:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  /* ---------------- FILTERING LOGIC ---------------- */
  // The API already filters for unread/read based on tab
  // We don't need additional filtering here - just use the data as-is
  const filteredToday = todayEmails;
  const filtered7Days = last7DaysEmails;
  const filtered30Days = last30DaysEmails;
  const filteredOlder = olderEmails;

  const unreadCountForSwitcher = realUnreadCount || [...todayEmails, ...last7DaysEmails, ...last30DaysEmails, ...olderEmails].filter(
    (i) => !i.read
  ).length;

  const readCountForSwitcher = [...todayEmails, ...last7DaysEmails, ...last30DaysEmails, ...olderEmails].filter(
    (i) => i.read
  ).length;

  const allCountForSwitcher = [...todayEmails, ...last7DaysEmails, ...last30DaysEmails, ...olderEmails].length;

  /* ---------------- REFRESH FEATURE ---------------- */
  const refreshInbox = async () => {
    setNextPageToFetch(1);
    setHasMorePages(true);
    setVisibleToday(INITIAL_VISIBLE);
    setVisible7Days(INITIAL_VISIBLE);
    setVisible30Days(INITIAL_VISIBLE);
    setVisibleOlder(INITIAL_VISIBLE);
    setTodayEmails([]);
    setLast7DaysEmails([]);
    setLast30DaysEmails([]);
    setOlderEmails([]);
    // Trigger refetch by resetting state
    window.location.reload();
  };

  /* ---------------- ACTION HANDLERS ---------------- */
  const onMoveToTrash = async (emailId: string) => {
    try {
      await emailService.moveToTrash(emailId);
      // Remove from all local lists immediately (optimistic UI)
      setTodayEmails(prev => prev.filter(e => e.emailId !== emailId));
      setLast7DaysEmails(prev => prev.filter(e => e.emailId !== emailId));
      setLast30DaysEmails(prev => prev.filter(e => e.emailId !== emailId));
      setOlderEmails(prev => prev.filter(e => e.emailId !== emailId));
    } catch (err) {
      console.error("Failed to move to trash", err);
    }
  };

  const onToggleReadLater = async (emailId: string, isReadLater: boolean) => {
    try {
      await emailService.toggleReadLater(emailId, isReadLater);
      // Update local state isReadLater status in all lists
      const updateList = (prev: any[]) => prev.map(e =>
        e.emailId === emailId ? { ...e, isReadLater: isReadLater } : e
      );
      setTodayEmails(updateList);
      setLast7DaysEmails(updateList);
      setLast30DaysEmails(updateList);
      setOlderEmails(updateList);
    } catch (err) {
      console.error("Failed to toggle read later", err);
    }
  };

  /* ---------------- PAGINATION ---------------- */
  // Single "View more" button at bottom
  const totalEmails = todayEmails.length + last7DaysEmails.length + last30DaysEmails.length + olderEmails.length;
  const totalVisible = visibleToday + visible7Days + visible30Days + visibleOlder;
  
  // Show more local data across all sections
  const loadMoreEmails = async () => {
    // First, try to show more local data in any section that has hidden emails
    let expanded = false;
    
    if (visibleToday < filteredToday.length) {
      setVisibleToday(prev => Math.min(prev + LOAD_MORE, filteredToday.length));
      expanded = true;
    } else if (visible7Days < filtered7Days.length) {
      setVisible7Days(prev => Math.min(prev + LOAD_MORE, filtered7Days.length));
      expanded = true;
    } else if (visible30Days < filtered30Days.length) {
      setVisible30Days(prev => Math.min(prev + LOAD_MORE, filtered30Days.length));
      expanded = true;
    } else if (visibleOlder < filteredOlder.length) {
      setVisibleOlder(prev => Math.min(prev + LOAD_MORE, filteredOlder.length));
      expanded = true;
    }
    
    // If all local data is shown and API has more, fetch next batch
    if (!expanded && hasMorePages && !loadingMore) {
      await loadNextBatch();
    }
  };

  // Show global "View more" button if there's hidden local data OR more API pages
  const hasHiddenEmails = visibleToday < filteredToday.length || 
                          visible7Days < filtered7Days.length || 
                          visible30Days < filtered30Days.length || 
                          visibleOlder < filteredOlder.length;
  const showGlobalViewMore = hasHiddenEmails || (hasMorePages && !loadingMore);

  const isTodayEmpty = filteredToday.length === 0;
  const is7DaysEmpty = filtered7Days.length === 0;
  const is30DaysEmpty = filtered30Days.length === 0;
  const isOlderEmpty = filteredOlder.length === 0;

  const allEmpty = isTodayEmpty && is7DaysEmpty && is30DaysEmpty && isOlderEmpty;

  return (
    <>
      {/* Loading state */}
      {loading && <InboxSkeleton />}

      {/* Error state */}
      {error && !loading && (
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

      {/* Content - only show if not loading */}
      {!loading && !error && (
        <>
          {/* ---------------- MOBILE RENDER ---------------- */}
          <MobileInboxSection
            tab={tab}
            setTab={setTab}
            filteredToday={filteredToday}
            filtered7Days={filtered7Days}
            filtered30Days={filtered30Days}
            filteredOlder={filteredOlder}
            unreadCount={unreadCountForSwitcher}
            readCount={readCountForSwitcher}
            allCount={allCountForSwitcher}
            hasMorePages={hasMorePages}
            loadingMore={loadingMore}
            onRequestMore={loadNextBatch}
          />

          {/* ---------------- DESKTOP RENDER ---------------- */}
          <div className="hidden md:flex w-full flex-col gap-8">
            {/* HEADER */}
            <div className="w-full">
              <div className="w-full h-[78px] bg-white border border-[#E5E7E8] flex items-center justify-between px-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <h2 className="text-[26px] font-bold text-[#0C1014]">
                    Your Reads
                  </h2>
                  <RefreshButton onClick={refreshInbox} />
                </div>

                <div className="flex items-center gap-4 px-4 shrink-0">
                  <div className="flex items-center gap-3 bg-white border border-[#DBDFE4] rounded-full px-3 py-2 shadow-sm">
                    <FlameBadge />
                    <ThemeToggle />
                  </div>
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

            {/* CONTENT */}
            <div className="w-full flex flex-col gap-10 mt-6 px-6">
              {/* ALL EMPTY */}
              {allEmpty && <EmptyInbox />}

              {/* TODAY */}
              {!isTodayEmpty && (
                <section>
                  <h3 className="text-[18px] font-semibold text-[#6F7680] mb-4">
                    Today
                  </h3>
                  {filteredToday.slice(0, visibleToday).map((item) => (
                    <div key={item.emailId} className="mb-2">
                      <NewsletterCard
                        {...item}
                        onMoveToTrash={onMoveToTrash}
                        onToggleReadLater={onToggleReadLater}
                      />
                    </div>
                  ))}
                </section>
              )}

              {/* LAST 7 DAYS */}
              {!is7DaysEmpty && (
                <section>
                  <h3 className="text-[18px] font-semibold text-[#6F7680] mb-4">
                    Last 7 days
                  </h3>
                  {filtered7Days.slice(0, visible7Days).map((item) => (
                    <div key={item.emailId} className="mb-2">
                      <NewsletterCard
                        {...item}
                        onMoveToTrash={onMoveToTrash}
                        onToggleReadLater={onToggleReadLater}
                      />
                    </div>
                  ))}
                </section>
              )}

              {/* LAST 30 DAYS */}
              {!is30DaysEmpty && (
                <section>
                  <h3 className="text-[18px] font-semibold text-[#6F7680] mb-4">
                    Last 30 days
                  </h3>
                  {filtered30Days.slice(0, visible30Days).map((item) => (
                    <div key={item.emailId} className="mb-2">
                      <NewsletterCard
                        {...item}
                        onMoveToTrash={onMoveToTrash}
                        onToggleReadLater={onToggleReadLater}
                      />
                    </div>
                  ))}
                </section>
              )}

              {/* OLDER */}
              {!isOlderEmpty && (
                <section>
                  <h3 className="text-[18px] font-semibold text-[#6F7680] mb-4">
                    Older
                  </h3>
                  {filteredOlder.slice(0, visibleOlder).map((item) => (
                    <div key={item.emailId} className="mb-2">
                      <NewsletterCard
                        {...item}
                        onMoveToTrash={onMoveToTrash}
                        onToggleReadLater={onToggleReadLater}
                      />
                    </div>
                  ))}
                </section>
              )}

              {/* GLOBAL VIEW MORE BUTTON */}
              {showGlobalViewMore && (
                <div className="w-full flex justify-center mt-8 pb-12">
                  <button
                    onClick={loadMoreEmails}
                    disabled={loadingMore}
                    className="px-8 py-3 border border-gray-300 rounded-full text-black font-medium hover:bg-gray-50 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingMore ? "Loading..." : "View more"}
                  </button>
                </div>
              )}

              {loadingMore && (
                <div className="flex justify-center mt-6 pb-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
