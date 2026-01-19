"use client";

import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import { Publisher } from "./page";
import MobileInboxCard from "@/components/inbox/InboxCard";
import FilterButton, { FilterValue } from "@/components/FilterButton";
import Link from "next/link";
import userService, { Subscription } from "@/services/user";

/* ============================================================
   HELPER: Convert API subscription to Publisher format
============================================================ */
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
    active: sub.is_active !== false,
    firstMail: formatDate(sub.first_received),
    newsletters: [],
    senderEmail: sub.sender_email,
  };
}

/* ============================================================
   MOBILE MAIN SCREEN (Pixel-Perfect)
============================================================ */
export default function MobileSubscriptionSection() {
  const { t } = useTranslation("common");
  const [selectedPublisher, setSelectedPublisher] =
    useState<Publisher | null>(null);
  const [tab, setTab] = useState<"active" | "inactive">("active");
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch subscriptions from API
  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const subscriptions = await userService.getSubscriptions();
        const converted = subscriptions.map(convertSubscriptionToPublisher);
        setPublishers(converted);
      } catch (error) {
        console.error("Failed to fetch subscriptions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, []);

  const active = publishers.filter((p) => p.active);
  const inactive = publishers.filter((p) => !p.active);

  const publicationCount =
    tab === "active" ? active.length : inactive.length;

  if (selectedPublisher) {
    return (
      <MobilePublisherDetail
        publisher={selectedPublisher}
        onBack={() => setSelectedPublisher(null)}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F6FA] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C46A54]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F6FA]">
      {/* HEADER */}
      <div className="flex items-center h-[60px] px-4 bg-[#F5F6FA] border-[#EAECF0]">
        <Link href="/profile" aria-label="Go back to profile">
          <ArrowLeft size={22} className="mr-3" />
        </Link>
        <p className="text-[18px] font-semibold flex-1 text-center mr-6">
          {t("nav.subscriptions")}
        </p>
      </div>

      <div className="mt-2 bg-white rounded-2xl min-h-[92vh] shadow-[0_1px_3px_rgba(0,0,0,0.08)] overflow-hidden">
        {/* COUNT + SEGMENTED CONTROL */}
        <div className="flex justify-between items-center px-4 mt-5">
          <p className="text-[16px] font-medium">
            {publicationCount} {t("mobile.publication")}
          </p>

          <div className="flex rounded-full bg-white border border-[#D8DDE3] p-1">
            <button
              onClick={() => setTab("active")}
              className={`px-4 py-1 text-[14px] font-medium rounded-full ${
                tab === "active"
                  ? "bg-[#D0D4DB] text-[#0C0D0E]"
                  : "text-[#6F7680]"
              }`}
            >
              {t("mobile.active")}
            </button>

            <button
              onClick={() => setTab("inactive")}
              className={`px-4 py-1 text-[14px] font-medium rounded-full ${
                tab === "inactive"
                  ? "bg-[#D0D4DB] text-[#0C0D0E]"
                  : "text-[#6F7680]"
              }`}
            >
              {t("mobile.inactive")}
            </button>
          </div>
        </div>

        {/* LIST */}
        <div className="mt-6 bg-white">
          {(tab === "active" ? active : inactive).map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPublisher(p)}
              className="w-full flex items-center px-4 py-4 border-b border-[#EEF0F2]"
            >
              <div className="w-[48px] h-[48px] rounded-full overflow-hidden bg-[#F1F3F5] mr-3">
                <img
                  src={p.logo}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex flex-col items-start">
                <p className="text-[15px] font-semibold text-left">
                  {p.name}
                </p>
                <p className="text-[13px] text-[#6F7680] text-left leading-[18px]">
                  {p.totalItems} items, most recent was{" "}
                  {p.lastReceivedAgo}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   PUBLISHER DETAIL — Filter Applied
============================================================ */
function MobilePublisherDetail({
  publisher,
  onBack,
}: {
  publisher: Publisher;
  onBack: () => void;
}) {
  const { t } = useTranslation("common");
  const [state, setState] = useState(publisher);
  const [filter, setFilter] = useState<FilterValue>("all");

  const total = state.newsletters.length;
  const read = state.newsletters.filter((n) => n.read).length;
  const readPercentage = total
    ? Math.round((read / total) * 100)
    : 0;

  /* ------------------ FILTER LOGIC ------------------ */
  const filteredNewsletters = useMemo(() => {
    if (filter === "all") return state.newsletters;
    if (filter === "read")
      return state.newsletters.filter((n) => n.read);
    return state.newsletters.filter((n) => !n.read);
  }, [state.newsletters, filter]);

  return (
    <div className="min-h-screen bg-[#F5F6FA]">
      {/* HEADER */}
      <div className="flex items-center h-[60px] px-4 bg-[#F5F6FA]">
        <ArrowLeft size={22} onClick={onBack} className="mr-3" />
        <p className="text-[18px] font-semibold flex-1 text-center mr-6">
          {state.name}
        </p>
      </div>

      {/* CONTENT */}
      <div className="mt-2 bg-white rounded-2xl min-h-[92vh] border border-black/10 shadow-[0_1px_3px_rgba(0,0,0,0.08)] overflow-hidden">
        {/* TOP CARD */}
        <div className="p-5">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
              <div className="w-[48px] h-[48px] rounded-full overflow-hidden">
                <img
                  src={state.logo}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-[17px] font-bold">{state.name}</p>
            </div>

            <p className="text-[14px] text-[#6F7680]">
              {state.description}
            </p>

            <p className="text-[14px]">
              <span className="font-medium">{t("mobile.firstMail")}: </span>
              <span className="text-[#6F7680]">
                {state.firstMail}
              </span>
            </p>
          </div>

          <div className="flex justify-between items-center mt-6">
            <button className="text-[17px] text-gray-500 font-semibold">
              {t("mobile.unsubscribe")}
            </button>

            <div className="flex items-center gap-3">
              <span
                className={`text-[16px] font-medium ${
                  state.active
                    ? "text-[#0C1014]"
                    : "text-[#A2AAB4]"
                }`}
              >
                {state.active ? t("mobile.active") : t("mobile.inactive")}
              </span>

              <button
                onClick={() =>
                  setState((prev) => ({
                    ...prev,
                    active: !prev.active,
                  }))
                }
                className={`w-[46px] h-[26px] rounded-full relative transition ${
                  state.active
                    ? "bg-[#C46A54]"
                    : "bg-[#D0D4DB]"
                }`}
              >
                <span
                  className={`absolute top-[4px] w-[18px] h-[18px] bg-white rounded-full transition ${
                    state.active
                      ? "left-[22px]"
                      : "left-[4px]"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* ENGAGEMENT */}
        <div className="bg-[#F3F4F6] mx-4 mb-4 rounded-2xl p-5">
          <p className="text-[18px] font-semibold mb-4">
            {t("mobile.yourEngagement")}
          </p>

          <div className="flex justify-between mb-4">
            <div>
              <p className="text-[14px] text-[#A2AAB4]">
                {t("mobile.totalNewsletterReceived")}
              </p>
              <p className="text-[24px] font-bold">{total}</p>
            </div>

            <div>
              <p className="text-[14px] text-[#A2AAB4]">
                {t("mobile.readPercentage")}
              </p>
              <p className="text-[24px] font-bold">
                {readPercentage}%
              </p>
            </div>
          </div>

          <div className="h-[8px] rounded-full bg-[#ECEFF3] overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${readPercentage}%`,
                background:
                  "linear-gradient(90deg, #CA1C1C 0%, #01AF0C 100%)",
              }}
            />
          </div>
        </div>

        {/* RECENT ISSUES */}
        <div className="px-4 pb-6">
          <div className="flex justify-between items-center">
            <p className="text-[16px] font-semibold">
              {t("mobile.recentIssues")}
            </p>
            <FilterButton value={filter} onChange={setFilter} />
          </div>

          <div className="mt-5 space-y-4">
            {filteredNewsletters.map((n) => (
              <MobileInboxCard
                key={n.id}
                {...n}
                slug={n.id}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
