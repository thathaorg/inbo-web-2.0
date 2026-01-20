"use client";

import { useState, useMemo, useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, List, LayoutGrid } from "lucide-react";
import NewsletterCard from "@/components/inbox/InboxCard";
import TabSwitcher, { TabType } from "@/components/inbox/TabSwitcher";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import MobileSubscriptionSection from "./MobileSubscriptionSection";
import userService, { Subscription } from "@/services/user";
import newsletterService, { NewsletterPost } from "@/services/newsletter";
import { fetchNewsletterProviderDetails } from "@/services/email";

/* --------------------------------------------
   TYPES
--------------------------------------------- */
type Newsletter = {
  id: string;               // used as slug
  title: string;
  description: string;

  date: string;             // extracted from publishedAt
  time: string;             // extracted from readTime

  tag: string;              // category

  badgeText: string;
  badgeColor: string;
  badgeTextColor: string;

  author: string;

  thumbnail: string;

  slug: string;             // duplicate id field for NewsletterCard compatibility

  read: boolean;
  readingProgress?: number | null;
};



export type Publisher = {
  id: string;

  name: string;
  description: string;        // 🔥 missing earlier (Figma subtitle)
  logo: string;

  totalItems: number;           // 🔥 "10 items"
  lastReceivedAgo: string;

  active: boolean;            // 🔥 toggle state stays here
  firstMail: string;

  newsletters: Newsletter[];
  
  senderEmail?: string;       // From API
};

/* --------------------------------------------
   HELPER: Convert API subscription to Publisher format
--------------------------------------------- */
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffHours < 1) return "just now";
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
  return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function convertSubscriptionToPublisher(sub: Subscription): Publisher {
  return {
    id: sub.id,
    name: sub.name,
    description: sub.sender_email,
    logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(sub.name)}&background=random&size=62`,
    totalItems: sub.email_count,
    lastReceivedAgo: formatTimeAgo(sub.last_received),
    active: sub.is_active !== false, // Default to active if not specified
    firstMail: formatDate(sub.first_received),
    newsletters: [], // Will be populated when viewing detail
    senderEmail: sub.sender_email,
  };
}

function convertPostToNewsletter(post: NewsletterPost): Newsletter {
  const date = new Date(post.published_at);
  const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  
  // Calculate reading time (approx 200 words per minute)
  let wordCount = 0;
  if (post.content) {
    const text = post.content.replace(/<[^>]*>?/gm, ''); // Simple strip tags
    wordCount = text.split(/\s+/).length;
  } else if (post.summary) {
    wordCount = post.summary.split(/\s+/).length;
  }
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));
  
  return {
    id: post.id,
    title: post.title,
    description: post.summary || "",
    date: dateStr,
    time: `${readingTime} min read`,
    tag: "Newsletter",
    badgeText: post.newsletter_name?.charAt(0).toUpperCase() || "N",
    badgeColor: "#E5E7EB",
    badgeTextColor: "#374151",
    author: post.newsletter_name,
    thumbnail: post.newsletter_icon_url || "",
    slug: post.id,
    read: post.is_read,
    readingProgress: null,
  };
}



/* --------------------------------------------
   PAGE
--------------------------------------------- */

export default function SubscriptionsPage() {
  const { t } = useTranslation("common");
  const [activeView, setActiveView] = useState<"list" | "grid">("list");
  const [inactiveView, setInactiveView] = useState<"list" | "grid">("list");
  const [activeVisible, setActiveVisible] = useState(6);
  const [inactiveVisible, setInactiveVisible] = useState(6);
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [loading, setLoading] = useState(true);
  // Remove local search bar, use global SearchBar for filtering

  const [selectedPublisherId, setSelectedPublisherId] = useState<string | null>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Fetch subscriptions from API
  const fetchSubscriptions = async () => {
    try {
      const subscriptions = await userService.getSubscriptions(true);
      const converted = subscriptions.map(convertSubscriptionToPublisher);
      setPublishers(converted);
      
      // Fetch logos and details in background
      subscriptions.forEach(async (sub) => {
        if (sub.sender_email) {
          try {
            const details = await fetchNewsletterProviderDetails(sub.sender_email);
            if (details) {
              setPublishers(prev => prev.map(p => 
                p.id === sub.id ? { 
                  ...p, 
                  logo: details.logo || p.logo,
                  description: details.description || p.description,
                } : p
              ));
            }
          } catch (e) {
            // Ignore fetch errors
          }
        }
      });
    } catch (error) {
      console.error("Failed to fetch subscriptions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);



  // Listen for custom search event from SearchBar
  const [searchQuery, setSearchQuery] = useState("");
  useEffect(() => {
    const handler = (e: any) => setSearchQuery(e.detail || "");
    window.addEventListener("subscriptions-search", handler);
    return () => window.removeEventListener("subscriptions-search", handler);
  }, []);

  const filteredPublishers = useMemo(() => {
    if (!searchQuery.trim()) return publishers;
    const q = searchQuery.trim().toLowerCase();
    return publishers.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.description && p.description.toLowerCase().includes(q)) ||
      (p.senderEmail && p.senderEmail.toLowerCase().includes(q))
    );
  }, [publishers, searchQuery]);

  const selectedPublisher = useMemo(() => 
    publishers.find(p => p.id === selectedPublisherId) || null
  , [publishers, selectedPublisherId]);

  if (isMobile) {
    return <MobileSubscriptionSection/>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F6F7F9]">
      {/* ================= HEADER (ALWAYS) - Sticky ================= */}
      <header className="sticky top-0 z-50 h-[78px] bg-white border-b border-[#E5E7EB] flex items-center px-6 shadow-sm">
        <h1 className="text-[26px] font-bold text-[#0C1014]">
          {t("subscriptions.title")}
        </h1>
      </header>

      {/* ================= MAIN ================= */}
      <main className="flex-1 p-6">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C46A54]"></div>
          </div>
        ) : !selectedPublisher ? (
          <PublisherList
            publishers={filteredPublishers}
            activeView={activeView}
            setActiveView={setActiveView}
            inactiveView={inactiveView}
            setInactiveView={setInactiveView}
            activeVisible={activeVisible}
            setActiveVisible={setActiveVisible}
            inactiveVisible={inactiveVisible}
            setInactiveVisible={setInactiveVisible}
            onSelect={(p) => setSelectedPublisherId(p.id)}
          />
        ) : (
          <PublisherDetail
            publisher={selectedPublisher}
            onBack={() => setSelectedPublisherId(null)}
            onUpdate={fetchSubscriptions}
          />
        )}
      </main>
    </div>
  );
}

/* --------------------------------------------
   PAGE 1 – PUBLISHER LIST
--------------------------------------------- */
function PublisherList({
  publishers,
  activeView,
  setActiveView,
  inactiveView,
  setInactiveView,
  activeVisible,
  setActiveVisible,
  inactiveVisible,
  setInactiveVisible,
  onSelect,
}: {
  publishers: Publisher[];
  activeView: "list" | "grid";
  setActiveView: (v: "list" | "grid") => void;
  inactiveView: "list" | "grid";
  setInactiveView: (v: "list" | "grid") => void;
  activeVisible: number;
  setActiveVisible: Dispatch<SetStateAction<number>>;
  inactiveVisible: number;
  setInactiveVisible: Dispatch<SetStateAction<number>>;
  onSelect: (p: Publisher) => void;
  })
{
  const active = publishers.filter((p) => p.active);
  const inactive = publishers.filter((p) => !p.active);
  const visibleActive = active.slice(0, activeVisible);
  const visibleInactive = inactive.slice(0, inactiveVisible);

  return (
    <div className="space-y-10">
      <SectionHeader
        title="Active Subscriptions"
        count={active.length}
        view={activeView}
        setView={setActiveView}
      />

      <PublisherGrid
        view={activeView}
        data={visibleActive}
        onSelect={onSelect}
      />
      {activeVisible < active.length && (
        <div className="flex justify-center">
          <button
            onClick={() => setActiveVisible((v) => v + 6)}
            className="px-6 py-2 rounded-full bg-[#C46A54] text-white text-sm font-medium"
          >
            View more
          </button>
        </div>
      )}


      <SectionHeader
        title="Inactive Subscriptions"
        count={inactive.length}
        view={inactiveView}
        setView={setInactiveView}
      />

      <PublisherGrid
        view={inactiveView}
        data={visibleInactive}
        onSelect={onSelect}
      />
      {inactiveVisible < inactive.length && (
        <div className="flex justify-center">
          <button
            onClick={() => setInactiveVisible((v) => v + 6)}
            className="px-6 py-2 rounded-full bg-[#C46A54] text-white text-sm font-medium"
          >
            View more
          </button>
        </div>
      )}



    </div>
  );
}

function PublisherGrid({
  view,
  data,
  onSelect,
}: {
  view: "list" | "grid";
  data: Publisher[];
  onSelect: (p: Publisher) => void;
}) {
  return (
    <div
      className={
        view === "grid"
          ? "grid grid-cols-1 md:grid-cols-2 gap-4"
          : "flex flex-col gap-3"
      }
    >
      {data.map((p, index) => (
        <button
          key={`${p.id}-${index}`}
          onClick={() => onSelect(p)}
          className="flex items-center gap-4 p-4 rounded-xl border border-[#F3F4F6] bg-white text-left"
        >
          {/* Logo */}
          <div className="w-[44px] h-[44px] rounded-full overflow-hidden flex-shrink-0">
            <img
              src={p.logo}
              alt={p.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Text */}
          <div className="flex flex-col">
            <p className="text-[16px] font-medium text-[#0C1014]">
              {p.name}
            </p>

            {p.active ? (
              <p className="text-[14px] text-[#6F7680]">
                {p.totalItems} items, most recent was {p.lastReceivedAgo}
              </p>
            ) : (
              <p className="text-[14px] text-[#A2AAB4]">
                This newsletter is currently inactive.
              </p>
            )}
          </div>
        </button>

      ))}
    </div>
  );
}

/* --------------------------------------------
   PAGE 2 – PUBLISHER DETAIL
--------------------------------------------- */
function PublisherDetail({
  publisher,
  onBack,
  onUpdate,
}: {
  publisher: Publisher;
  onBack: () => void;
  onUpdate: () => void;
}) {
  const [tab, setTab] = useState<TabType>("unread");
  const [publisherState, setPublisherState] = useState(publisher);
  const [loadingAction, setLoadingAction] = useState(false);

  // Update local state when prop changes
  useEffect(() => {
    setPublisherState(publisher);
  }, [publisher]);

  // Fetch newsletters for this publisher
  useEffect(() => {
    const fetchNewsletters = async () => {
      if (!publisher.name) return;
      try {
        const response = await newsletterService.getPosts({
          search: publisher.name,
          page_size: 10
        });
        if (response.results) {
          const newsletters = response.results
            .filter(post => 
              post.newsletter_name?.toLowerCase().includes(publisher.name.toLowerCase()) || 
              publisher.name.toLowerCase().includes(post.newsletter_name?.toLowerCase() || "")
            )
            .slice(0, 5)
            .map(convertPostToNewsletter);
            
          setPublisherState((prev) => ({
            ...prev,
            newsletters: newsletters,
          }));
        }
      } catch (error) {
        console.error("Failed to fetch newsletters:", error);
      }
    };

    fetchNewsletters();
  }, [publisher.name]);

  const toggleActive = async () => {
    if (loadingAction) return;
    try {
      setLoadingAction(true);
      const newActive = !publisherState.active;
      
      // Call API
      await userService.toggleSubscription(publisher.id, newActive);
      
      // Update local state immediately
      setPublisherState((prev) => ({
        ...prev,
        active: newActive,
      }));
      
      // Refresh parent list
      onUpdate();
    } catch (error) {
      console.error("Failed to toggle subscription:", error);
      // Revert on error if needed
    } finally {
      setLoadingAction(false);
    }
  };

  const handleUnsubscribe = async () => {
    if (loadingAction) return;
    if (!confirm("Are you sure you want to unsubscribe from " + publisher.name + "?")) return;
    
    try {
      setLoadingAction(true);
      await userService.toggleSubscription(publisher.id, false);
      onUpdate();
      onBack();
    } catch (error) {
      console.error("Failed to unsubscribe:", error);
    } finally {
      setLoadingAction(false);
    }
  };

  const total = publisher.newsletters.length;
  const readCount = publisher.newsletters.filter((n) => n.read).length;
  const unreadCount = total - readCount;
  const readPercent = total ? Math.round((readCount / total) * 100) : 0;

  const filtered = useMemo(() => {
    if (tab === "read") return publisher.newsletters.filter((n) => n.read);
    if (tab === "unread") return publisher.newsletters.filter((n) => !n.read);
    return publisher.newsletters;
  }, [tab, publisher.newsletters]);

  return (
    <div className="space-y-8">
      {/* BACK */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-[14px] text-black"
      >
        <ArrowLeft size={18} /> back
      </button>

      {/* ================= PUBLISHER CARD ================= */}
      <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(219,219,219,0.25)] p-6 flex justify-between">
        <div className="flex gap-4">
          {/* Logo */}
          <div className="w-[62px] h-[62px] rounded-full bg-black overflow-hidden flex items-center justify-center">
            <img
              src={publisher.logo || "https://placehold.co/62x62"}
              alt={publisher.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Text */}
          <div className="flex flex-col justify-center gap-3">
            <div className="space-y-1">
              <p className="text-[16px] font-medium text-black">
                {publisher.name}
              </p>
              <p className="text-[14px] text-[#A2AAB4]">
                {publisherState.description}
              </p>
            </div>

            <p className="text-[14px]">
              <span className="font-medium text-[#0C1014]">
                First mail:&nbsp;
              </span>
              <span className="text-[#6F7680]">{publisher.firstMail}</span>
            </p>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex flex-col items-end gap-5">
          {/* Active Toggle */}
          <div className="flex items-center gap-3">
            <span
              style={{ fontFamily: "Segoe UI" }}
              className={`text-[16px] font-medium ${
                publisherState.active ? "text-[#0C1014]" : "text-[#A2AAB4]"
              }`}
            >
              {publisherState.active ? "Active" : "Inactive"}
            </span>
            <button
              onClick={toggleActive}
              disabled={loadingAction}
              className={`w-[36px] h-[20px] rounded-full relative transition ${
                publisherState.active ? "bg-[#C46A54]" : "bg-[#DBDFE4]"
              } ${loadingAction ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span
                className={`absolute top-[2px] w-[16px] h-[16px] bg-white rounded-full transition ${
                  publisherState.active ? "left-[18px]" : "left-[2px]"
                }`}
              />
            </button>
          </div>

          {/* Unsubscribe */}
          <button 
            onClick={handleUnsubscribe}
            disabled={loadingAction}
            className={`px-4 py-2 rounded-full border border-[#CA1C1C] text-[#CA1C1C] text-[14px] font-medium ${loadingAction ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#CA1C1C] hover:text-white transition-colors'}`}
          >
            {loadingAction ? 'Processing...' : 'Unsubscribe'}
          </button>
        </div>
      </div>

      {/* ================= ENGAGEMENT ================= */}
      <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(219,219,219,0.25)] p-6 space-y-6">
        <h3 className="text-[20px] font-medium">Your Engagement</h3>

        <div className="flex justify-between">
          <div>
            <p className="text-[16px] text-[#A2AAB4]">
              Total newsletter received
            </p>
            <p className="text-[24px] font-medium">{total}</p>
          </div>

          <div>
            <p className="text-[16px] text-[#A2AAB4]">Read percentage</p>
            <p className="text-[24px] font-medium">{readCount} read</p>
          </div>
        </div>

        {/* Gradient Bar */}
        <div className="h-[8px] bg-[#F3F4F6] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${readPercent}%`,
              background:
                "linear-gradient(90deg, #CA1C1C 0%, #01AF0C 100%)",
            }}
          />
        </div>
      </div>

      {/* ================= RECENT ISSUES ================= */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-[16px] font-medium">Recent Issues</p>
          <TabSwitcher
            tab={tab}
            setTab={setTab}
            unreadCount={unreadCount}
          />
        </div>

        <div className="space-y-3">
          {filtered.map((n) => (
            <NewsletterCard key={n.id} {...n} slug={n.id} />
          ))}
        </div>
      </div>
    </div>
  );
}


/* --------------------------------------------
   SHARED
--------------------------------------------- */
function SectionHeader({
  title,
  count,
  view,
  setView,
}: {
  title: string;
  count: number;
  view: "list" | "grid";
  setView: (v: "list" | "grid") => void;
}) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-[#A2AAB4]">{count} Newsletter</p>
      </div>

      <div className="flex rounded-full border border-[#DBDFE4] overflow-hidden">
        <button
          onClick={() => setView("list")}
          className={`p-2 ${
            view === "list" ? "bg-[#0C1014] text-white" : "text-[#A2AAB4]"
          }`}
        >
          <List size={18} />
        </button>
        <button
          onClick={() => setView("grid")}
          className={`p-2 ${
            view === "grid" ? "bg-[#0C1014] text-white" : "text-[#A2AAB4]"
          }`}
        >
          <LayoutGrid size={18} />
        </button>
      </div>
    </div>
  );
}
