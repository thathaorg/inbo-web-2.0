"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

import NewsletterCard from "@/components/inbox/InboxCard";
import FilterButton, {
  FilterValue,
  FILTER_LABELS,
} from "@/components/FilterButton";
import EmptyFavourite from "@/components/EmptyFavorite";
import MobileFavoriteSection from "./MobileFavoriteSection";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import emailService, { EmailListItem } from "@/services/email";

/* --------------------- HELPERS --------------------- */

function transformEmailToCard(email: EmailListItem) {
  const dateReceived = email.dateReceived ? new Date(email.dateReceived) : new Date();

  // Format date like "Oct 3rd"
  const day = dateReceived.getDate();
  const month = dateReceived.toLocaleDateString("en-US", { month: "short" });
  const daySuffix = day === 1 || day === 21 || day === 31 ? 'st' :
    day === 2 || day === 22 ? 'nd' :
      day === 3 || day === 23 ? 'rd' : 'th';
  const dateStr = `${month} ${day}${daySuffix}`;

  return {
    badgeText: email.newsletterName || "Newsletter",
    badgeColor: "#E0F2FE",
    badgeTextColor: "#0369A1",
    author: email.newsletterName || email.sender || "Unknown",
    title: email.subject || "No Subject",
    description: email.contentPreview || "No preview available",
    date: dateStr,
    time: "2 mins", // Placeholder or calculate if needed
    tag: "Email",
    thumbnail: email.newsletterLogo || null,
    read: email.isRead,
    slug: email.id,
    emailId: email.id,
    isFavorite: email.isFavorite,
    isReadLater: email.isReadLater,
  };
}

/* --------------------- PAGINATION --------------------- */

const INITIAL_VISIBLE = 5;
const LOAD_MORE = 5;

/* ----------------------------------------------------- */

export default function FavouritePage() {
  const { t } = useTranslation("common");
  const isMobile = useMediaQuery("(max-width: 768px)");

  const [items, setItems] = useState<any[]>([]);
  const [visible, setVisible] = useState(INITIAL_VISIBLE);
  const [loading, setLoading] = useState(true);

  /* -------- FILTER STATE -------- */
  const [filter, setFilter] = useState<FilterValue>("unread");

  useEffect(() => {
    async function fetchFavorites() {
      try {
        setLoading(true);
        const data = await emailService.getFavoriteEmails('latest');
        setItems(data.map(transformEmailToCard));
      } catch (err) {
        console.error("Failed to fetch favorites:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchFavorites();
  }, []);

  /* -------- FILTERED ITEMS -------- */
  const filteredItems = items.filter((item) => {
    if (filter === "all") return true;
    if (filter === "read") return item.read;
    return !item.read;
  });

  /* -------- ACTION HANDLERS -------- */
  const onMoveToTrash = async (emailId: string) => {
    try {
      await emailService.moveToTrash(emailId);
      // Remove from local list immediately
      setItems(prev => prev.filter(e => e.emailId !== emailId));
    } catch (err) {
      console.error("Failed to move to trash", err);
    }
  };

  const onToggleReadLater = async (emailId: string, isReadLater: boolean) => {
    try {
      await emailService.toggleReadLater(emailId, isReadLater);
      // Update local state
      setItems(prev => prev.map(e =>
        e.emailId === emailId ? { ...e, isReadLater } : e
      ));
    } catch (err) {
      console.error("Failed to toggle read later", err);
    }
  };

  const onToggleFavorite = async (emailId: string, isFavorite: boolean) => {
    try {
      await emailService.toggleFavorite(emailId, isFavorite);
      // If removing from favorites, remove from list; otherwise update
      if (!isFavorite) {
        setItems(prev => prev.filter(e => e.emailId !== emailId));
      } else {
        setItems(prev => prev.map(e =>
          e.emailId === emailId ? { ...e, isFavorite } : e
        ));
      }
    } catch (err) {
      console.error("Failed to toggle favorite", err);
    }
  };

  /* -------- MOBILE -------- */
  if (isMobile) {
    return <MobileFavoriteSection />;
  }

  const isEmpty = filteredItems.length === 0;
  const showMore = visible < filteredItems.length;

  const loadMore = () => {
    setVisible((prev) =>
      Math.min(prev + LOAD_MORE, filteredItems.length)
    );
  };

  /* ---------------- DESKTOP UI ---------------- */
  return (
    <div className="hidden min-h-[90%] md:flex w-full flex-col gap-8">
      {/* HEADER */}
      <div className="w-full h-[78px] bg-white border border-[#E5E7E8] flex items-center justify-between px-5 shadow-sm">
        <h2 className="text-[26px] font-bold text-[#0C1014]">
          {t("favorites.title")}
        </h2>

        {/* FILTER BUTTON */}
        <FilterButton value={filter} onChange={setFilter} />
      </div>

      {/* CONTENT */}
      <div className="w-full flex-1 flex px-6">
        {isEmpty ? (
          <div className="flex flex-1 items-center justify-center">
            <EmptyFavourite />
          </div>
        ) : (
          <div className="w-full flex flex-col mt-2">
            {filteredItems.slice(0, visible).map((item) => (
              <div key={item.slug} className="mb-3">
                <NewsletterCard
                  {...item}
                  onMoveToTrash={onMoveToTrash}
                  onToggleReadLater={onToggleReadLater}
                  onToggleFavorite={onToggleFavorite}
                />
              </div>
            ))}

            {showMore && (
              <button
                onClick={loadMore}
                className="mx-auto mt-4 px-6 py-2 border border-gray-300 rounded-full font-medium hover:bg-gray-200 transition"
              >
                {t("common.viewMore")}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
