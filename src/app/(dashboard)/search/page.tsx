"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "next/navigation";
import NewsletterCard from "@/components/inbox/InboxCard";
import FilterButton, { FilterValue } from "@/components/FilterButton";
import EmptyState from "@/components/SearchNotFound";
import NewsletterCarousel from "@/components/discover/NewsletterCarousel";
import { NewsletterEntry } from "@/components/discover/NewsletterCarouselItem";
import searchService, { EmailSearchResult } from "@/services/search";

/* --------------------- PAGINATION --------------------- */

const INITIAL_VISIBLE = 10;
const LOAD_MORE = 10;

/* --------------------- SEARCH RESULTS COMPONENT --------------------- */

function SearchResults() {
  const { t } = useTranslation("common");
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [emailResults, setEmailResults] = useState<EmailSearchResult[]>([]);
  const [visible, setVisible] = useState(INITIAL_VISIBLE);
  const [filter, setFilter] = useState<FilterValue>("all");
  const [loading, setLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch search results
  useEffect(() => {
    async function performSearch() {
      if (!query.trim()) {
        setEmailResults([]);
        setTotalResults(0);
        return;
      }

      setLoading(true);
      try {
        const { data, total } = await searchService.searchEmails(query, currentPage);
        setEmailResults(data);
        setTotalResults(total);
      } catch (error) {
        console.error("Search failed:", error);
        setEmailResults([]);
        setTotalResults(0);
      } finally {
        setLoading(false);
      }
    }

    performSearch();
  }, [query, currentPage]);

  // Transform email results to card format
  const transformedItems = useMemo(() => {
    return emailResults.map((email) => {
      const dateReceived = email.dateReceived ? new Date(email.dateReceived) : new Date();
      const day = dateReceived.getDate();
      const month = dateReceived.toLocaleDateString("en-US", { month: "short" });
      const daySuffix = day === 1 || day === 21 || day === 31 ? 'st' :
        day === 2 || day === 22 ? 'nd' :
          day === 3 || day === 23 ? 'rd' : 'th';
      const dateStr = `${month} ${day}${daySuffix}`;

      return {
        badgeText: email.newsletterName || "Email",
        badgeColor: "#E0F2FE",
        badgeTextColor: "#0369A1",
        author: email.newsletterName || email.sender || "Unknown",
        title: email.subject || "No Subject",
        description: email.contentPreview || "No preview available",
        date: dateStr,
        time: "2 mins",
        tag: "Email",
        thumbnail: email.newsletterLogo || null,
        newsletterLogo: email.newsletterLogo,
        newsletterName: email.newsletterName,
        read: email.isRead,
        slug: email.id,
        emailId: email.id,
      };
    });
  }, [emailResults]);

  /* APPLY FILTER */
  const filteredItems = useMemo(() => {
    switch (filter) {
      case "read":
        return transformedItems.filter((i) => i.read);
      case "unread":
        return transformedItems.filter((i) => !i.read);
      default:
        return transformedItems;
    }
  }, [transformedItems, filter]);

  const isEmpty = !loading && filteredItems.length === 0;
  const showMore = visible < filteredItems.length;

  const loadMore = () => {
    setVisible((prev) =>
      Math.min(prev + LOAD_MORE, filteredItems.length)
    );
  };

  return (
    <div className="min-h-[90%] w-full flex flex-col gap-8">
      {/* HEADER */}
      <div className="sticky top-0 z-50 w-full">
        <div className="w-full h-[78px] bg-white border border-[#E5E7E8] flex items-center justify-between px-5 shadow-sm">
          <div className="flex flex-col">
            <h2 className="text-[26px] font-bold text-[#0C1014]">
              {t("search.title", "Search Results")}
            </h2>
            {query && (
              <p className="text-sm text-gray-500">
                {loading ? "Searching..." : `${totalResults} results for "${query}"`}
              </p>
            )}
          </div>

          <FilterButton
            value={filter}
            onChange={(value) => {
              setFilter(value);
              setVisible(INITIAL_VISIBLE);
            }}
          />
        </div>
      </div>

      {/* CONTENT */}
      <div className="w-full flex-1 flex px-6">
        {loading ? (
          <div className="w-full flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
              <p className="text-gray-600">Searching...</p>
            </div>
          </div>
        ) : isEmpty ? (
          <div className="w-full flex flex-col">
            <div className="flex flex-1 pt-10 items-center justify-center">
              <EmptyState />
            </div>
          </div>
        ) : (
          /* SEARCH RESULTS */
          <div className="w-full flex flex-col mt-2">
            {filteredItems.slice(0, visible).map((item) => (
              <div key={item.slug} className="mb-3">
                <NewsletterCard {...item} onClick={() => {}} />
              </div>
            ))}

            {showMore && (
              <button
                onClick={loadMore}
                className="mx-auto mt-4 px-6 py-2 border border-gray-300 rounded-full text-black font-medium hover:bg-gray-50 transition"
              >
                {t("common.viewMore", "View more")}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ----------------------------------------------------- */

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[90%] w-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading search...</p>
        </div>
      </div>
    }>
      <SearchResults />
    </Suspense>
  );
}
