"use client";

import { useState, useEffect } from "react";
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
  };
}

/* --------------------- PAGINATION CONSTANTS --------------------- */
const EMAILS_PER_API_PAGE = 20; // Backend returns 20 emails per page
const PAGES_TO_LOAD = 3; // Load 3 API pages at once (60 emails total)
const INITIAL_VISIBLE = 50; // Show 50 emails initially per section
const LOAD_MORE = 50; // Load 50 more when "view more" is clicked
const REQUEST_TIMEOUT_MS = 60000; // Increased to 60s for slow backend

// Small helper to wrap API calls with a fast timeout so UI can respond quickly
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
    // Get today's start in local timezone
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    todayStart.setHours(0, 0, 0, 0);

    // Calculate time boundaries
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const today: any[] = [];
    const last7Days: any[] = [];
    const last30Days: any[] = [];
    const older: any[] = [];

    emails.forEach((email) => {
      const dateReceived = email.dateReceived ? new Date(email.dateReceived) : null;
      if (!dateReceived) {
        older.push(transformEmailToCard(email));
        return;
      }

      // Check if email is from today (using robust local date string comparison)
      if (dateReceived.toDateString() === now.toDateString()) {
        today.push(transformEmailToCard(email));
      } else if (dateReceived >= sevenDaysAgo) {
        last7Days.push(transformEmailToCard(email));
      } else if (dateReceived >= thirtyDaysAgo) {
        last30Days.push(transformEmailToCard(email));
      } else {
        older.push(transformEmailToCard(email));
      }
    });

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

        console.log(`🔄 Fetching inbox emails [Tab: ${tab}] - Pages ${nextPageToFetch} to ${nextPageToFetch + PAGES_TO_LOAD - 1}...`);

        // Define isRead filter based on tab
        const isReadParam = tab === "unread" ? false : tab === "read" ? true : undefined;

        // Fetch multiple pages in parallel (API returns 20 items per page)
        const pagePromises = [];
        for (let i = 0; i < PAGES_TO_LOAD; i++) {
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
          setNextPageToFetch(prev => prev + PAGES_TO_LOAD);
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

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
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

      // Fetch next 3 pages
      const pagePromises = [];
      for (let i = 0; i < PAGES_TO_LOAD; i++) {
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
        setNextPageToFetch(prev => prev + PAGES_TO_LOAD);
      }
    } catch (err) {
      console.error('Failed to load more emails:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  /* ---------------- FILTERING LOGIC ---------------- */
  // The API already filters for unread/read if the tab is not 'all'
  // But we keep this for consistency and handle any leftover logic
  const filterByTab = (items: any[]) => {
    // If API already filtered, this is mostly a no-op except for 'all' tab if we wanted sub-filtering
    // But since we catch everything in all, and specify unread/read in others, it's safe.
    if (tab === "unread") return items.filter((x) => !x.read);
    if (tab === "read") return items.filter((x) => x.read);
    return items;
  };

  const filteredToday = filterByTab(todayEmails);
  const filtered7Days = filterByTab(last7DaysEmails);
  const filtered30Days = filterByTab(last30DaysEmails);
  const filteredOlder = filterByTab(olderEmails);

  const unreadCountForSwitcher = realUnreadCount || [...todayEmails, ...last7DaysEmails, ...last30DaysEmails, ...olderEmails].filter(
    (i) => !i.read
  ).length;

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

  /* ---------------- LOAD MORE PAGES ---------------- */
  const loadMorePages = async () => {
    if (!hasMorePages || loadingMore) return;
    console.log(`📄 Loading next batch...`);
    await loadNextBatch();
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
  // Load more within sections (local data)
  const loadMoreSection = (
    visible: number,
    total: number,
    setter: React.Dispatch<React.SetStateAction<number>>
  ) => {
    if (visible < total) {
      setter((prev) => Math.min(prev + LOAD_MORE, total));
    }
  };

  const loadMoreToday = () => loadMoreSection(visibleToday, filteredToday.length, setVisibleToday);
  const loadMore7Days = () => loadMoreSection(visible7Days, filtered7Days.length, setVisible7Days);
  const loadMore30Days = () => loadMoreSection(visible30Days, filtered30Days.length, setVisible30Days);
  const loadMoreOlder = () => loadMoreSection(visibleOlder, filteredOlder.length, setVisibleOlder);

  const showMoreToday = visibleToday < filteredToday.length;
  const showMore7Days = visible7Days < filtered7Days.length;
  const showMore30Days = visible30Days < filtered30Days.length;
  const showMoreOlder = visibleOlder < filteredOlder.length;

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
                    <EmailBubble />
                    <FlameBadge />
                    <ThemeToggle />
                  </div>
                  <TabSwitcher
                    tab={tab}
                    setTab={setTab}
                    unreadCount={unreadCountForSwitcher}
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
                    <div key={item.slug} className="mb-2">
                      <NewsletterCard
                        {...item}
                        onMoveToTrash={onMoveToTrash}
                        onToggleReadLater={onToggleReadLater}
                      />
                    </div>
                  ))}
                  {showMoreToday && <CenterButton onClick={loadMoreToday} />}
                </section>
              )}

              {/* LAST 7 DAYS */}
              {!is7DaysEmpty && (
                <section>
                  <h3 className="text-[18px] font-semibold text-[#6F7680] mb-4">
                    Last 7 days
                  </h3>
                  {filtered7Days.slice(0, visible7Days).map((item) => (
                    <div key={item.slug} className="mb-2">
                      <NewsletterCard
                        {...item}
                        onMoveToTrash={onMoveToTrash}
                        onToggleReadLater={onToggleReadLater}
                      />
                    </div>
                  ))}
                  {showMore7Days && <CenterButton onClick={loadMore7Days} />}
                </section>
              )}

              {/* LAST 30 DAYS */}
              {!is30DaysEmpty && (
                <section>
                  <h3 className="text-[18px] font-semibold text-[#6F7680] mb-4">
                    Last 30 days
                  </h3>
                  {filtered30Days.slice(0, visible30Days).map((item) => (
                    <div key={item.slug} className="mb-2">
                      <NewsletterCard
                        {...item}
                        onMoveToTrash={onMoveToTrash}
                        onToggleReadLater={onToggleReadLater}
                      />
                    </div>
                  ))}
                  {showMore30Days && <CenterButton onClick={loadMore30Days} />}
                </section>
              )}

              {/* OLDER */}
              {!isOlderEmpty && (
                <section>
                  <h3 className="text-[18px] font-semibold text-[#6F7680] mb-4">
                    Older
                  </h3>
                  {filteredOlder.slice(0, visibleOlder).map((item) => (
                    <div key={item.slug} className="mb-2">
                      <NewsletterCard
                        {...item}
                        onMoveToTrash={onMoveToTrash}
                        onToggleReadLater={onToggleReadLater}
                      />
                    </div>
                  ))}
                  {showMoreOlder && <CenterButton onClick={loadMoreOlder} />}
                </section>
              )}

              {loadingMore && (
                <div className="flex justify-center mt-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              )}
            </div>

            {/* GLOBAL LOAD MORE BUTTON (Desktop) */}
            {hasMorePages && !loadingMore && (
              <div className="w-full flex justify-center pb-12">
                <button
                  onClick={loadMorePages}
                  className="px-6 py-2 border border-gray-300 rounded-full text-black font-medium hover:bg-gray-50 transition shadow-sm"
                >
                  Load more emails
                </button>
              </div>
            )}

            {loadingMore && (
              <div className="flex justify-center pb-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}

/* ---------------- "View more" BUTTON ---------------- */
function CenterButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="mx-auto mt-4 block px-6 py-2 border border-gray-300 rounded-full text-black font-medium hover:bg-white transition"
    >
      View more
    </button>
  );
}
