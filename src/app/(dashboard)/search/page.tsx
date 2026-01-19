"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import NewsletterCard from "@/components/inbox/InboxCard";
import FilterButton, { FilterValue } from "@/components/FilterButton";
import EmptyState from "@/components/SearchNotFound";
import NewsletterCarousel from "@/components/discover/NewsletterCarousel";
import { NewsletterEntry } from "@/components/discover/NewsletterCarouselItem";

/* --------------------- DUMMY SEARCH DATA --------------------- */

function generateSearchResults() {
  return Array.from({ length: 15 }).map((_, i) => ({
    badgeText: i % 2 === 0 ? "AI" : "BfM",
    badgeColor: i % 2 === 0 ? "#E0F2FE" : "#FEF3C7",
    badgeTextColor: i % 2 === 0 ? "#0369A1" : "#B45309",
    author: i % 2 === 0 ? "ByteByteGo Newsletter" : "Built for Mars",
    title:
      `Search Result ${i + 1}: ` +
      "A Deep Exploration Into Modern Software Systems",
    description:
      "This description is intentionally long to test truncation.",
    date: "Oct 3rd",
    time: "2 mins",
    tag: i % 2 === 0 ? "Software" : "Design",
    thumbnail: "/logos/forbes-sample.png",
    read: Math.random() > 0.5,
    slug: `search-${i + 1}`,
  }));
}

/* --------------------- DUMMY CAROUSEL DATA --------------------- */

function generateCarouselData(): NewsletterEntry[] {
  return Array.from({ length: 10 }).map((_, i) => ({
    badgeText: "AI",
    badgeColor: "#E0F2FE",
    badgeTextColor: "#0369A1",
    author: "Recommended Newsletter",
    title: `Recommended Article ${i + 1}`,
    description: "Curated based on your interests.",
    date: "Oct 6",
    time: "3 min read",
    tag: "Technology",
    thumbnail: "/logos/forbes-sample.png",
    slug: `carousel-${i}`,
    imageUrl: "/logos/forbes-sample.png",
    frequency: "Weekly",
    ctaLabel: "Subscribe",
  }));
}

/* --------------------- PAGINATION --------------------- */

const INITIAL_VISIBLE = 5;
const LOAD_MORE = 5;

/* ----------------------------------------------------- */

export default function SearchPage() {
  const { t } = useTranslation("common");
  const [items, setItems] = useState<any[]>([]);
  const [visible, setVisible] = useState(INITIAL_VISIBLE);
  const [carouselItems, setCarouselItems] =
    useState<NewsletterEntry[]>([]);
  const [filter, setFilter] = useState<FilterValue>("all");

  useEffect(() => {
    setItems(generateSearchResults());
    setCarouselItems(generateCarouselData());
  }, []);

  /* APPLY FILTER */
  const filteredItems = useMemo(() => {
    switch (filter) {
      case "read":
        return items.filter((i) => i.read);
      case "unread":
        return items.filter((i) => !i.read);
      default:
        return items;
    }
  }, [items, filter]);

  const isEmpty = filteredItems.length === 0;
  const showMore = visible < filteredItems.length;

  const loadMore = () => {
    setVisible((prev) =>
      Math.min(prev + LOAD_MORE, filteredItems.length)
    );
  };

  return (
    <div className="min-h-[90%] w-full flex flex-col gap-8">
      {/* HEADER */}
      <div className="w-full h-[78px] bg-white border border-[#E5E7E8] flex items-center justify-between px-5 shadow-sm">
        <h2 className="text-[26px] font-bold text-[#0C1014]">
          {t("search.title")}
        </h2>

        {/* ✅ WORKING FILTER BUTTON */}
        <FilterButton
          value={filter}
          onChange={(value) => {
            setFilter(value);
            setVisible(INITIAL_VISIBLE);
          }}
        />
      </div>

      {/* CONTENT */}
      <div className="w-full flex-1 flex px-6">
        {isEmpty ? (
          /* EMPTY SEARCH */
          <div className="w-full flex flex-col">
            <div className="flex flex-1 pt-10 items-center justify-center">
              <EmptyState />
            </div>

            {/* SUGGESTIONS */}
            <div className="w-full mt-10">
              <NewsletterCarousel
                title="You may also like"
                items={carouselItems}
                showArrows
              />
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

            {showMore && <CenterButton onClick={loadMore} />}

            {/* SIMILAR RESULTS */}
            <div className="w-full mt-12">
              <NewsletterCarousel
                title="Similar newsletters"
                items={carouselItems}
                showArrows
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- VIEW MORE BUTTON ---------------- */

function CenterButton({ onClick }: { onClick: () => void }) {
  const { t } = useTranslation("common");
  return (
    <button
      onClick={onClick}
      className="mx-auto mt-4 px-6 py-2 border border-gray-300 rounded-full text-black font-medium hover:bg-gray-50 transition"
    >
      {t("common.viewMore")}
    </button>
  );
}
