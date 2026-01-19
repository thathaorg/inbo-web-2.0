"use client";

import { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ListFilter } from "lucide-react";
import { useRouter } from "next/navigation";

import NewsletterCard from "@/components/inbox/InboxCard";
import FilterButton, {
  FilterValue,
  FILTER_LABELS,
} from "@/components/FilterButton";
import SortButton, { SortValue } from "@/components/SortButton";
import EmptyReadLater from "@/components/EmptyReadLater";
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
    isReadLater: email.isReadLater,
  };
}

/* --------------------- PAGINATION --------------------- */

const INITIAL_VISIBLE = 5;
const LOAD_MORE = 5;

/* ----------------------------------------------------- */

export default function ReadLaterPage() {
  const { t } = useTranslation("common");
  const isMobile = useMediaQuery("(max-width: 768px)");
  const router = useRouter();

  const [items, setItems] = useState<any[]>([]);
  const [visible, setVisible] = useState(INITIAL_VISIBLE);
  const [loading, setLoading] = useState(true);

  /* -------- FILTER STATE -------- */
  const [filter, setFilter] = useState<FilterValue>("unread");
  const [filterOpen, setFilterOpen] = useState(false);

  /* -------- SORT STATE -------- */
  const [sortBy, setSortBy] = useState<SortValue>("recent");

  useEffect(() => {
    async function fetchEmails() {
      try {
        setLoading(true);
        const data = await emailService.getReadLaterEmails(
          sortBy === 'oldest' ? 'oldest' : 'latest'
        );
        setItems(data.map(transformEmailToCard));
      } catch (err) {
        console.error("Failed to fetch read later emails:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchEmails();
  }, [sortBy]);

  /* -------- FILTERED ITEMS -------- */
  const filteredItems = items.filter((item) => {
    if (filter === "all") return true;
    if (filter === "read") return item.read;
    return !item.read;
  });

  /* -------- SORTED ITEMS -------- */
  const sortedItems = useMemo(() => {
    if (sortBy === "oldest") {
      return [...filteredItems].reverse();
    }
    return filteredItems;
  }, [filteredItems, sortBy]);

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
      // If removing from read later, remove from list; otherwise update
      if (!isReadLater) {
        setItems(prev => prev.filter(e => e.emailId !== emailId));
      } else {
        setItems(prev => prev.map(e =>
          e.emailId === emailId ? { ...e, isReadLater } : e
        ));
      }
    } catch (err) {
      console.error("Failed to toggle read later", err);
    }
  };

  const onToggleFavorite = async (emailId: string, isFavorite: boolean) => {
    try {
      await emailService.toggleFavorite(emailId, isFavorite);
      // Update local state
      setItems(prev => prev.map(e =>
        e.emailId === emailId ? { ...e, isFavorite } : e
      ));
    } catch (err) {
      console.error("Failed to toggle favorite", err);
    }
  };

  const isEmpty = sortedItems.length === 0;
  const showMore = visible < sortedItems.length;

  const loadMore = () => {
    setVisible((prev) =>
      Math.min(prev + LOAD_MORE, sortedItems.length)
    );
  };

  /* ======================================================
     📱 MOBILE UI
  ====================================================== */

  if (isMobile) {
    return (
      <div className="min-h-screen bg-[#F7F7F7]">
        {/* HEADER */}
        <div className="h-[64px] flex items-center px-4">
          <button onClick={() => router.push("/profile")}>
            <ArrowLeft className="w-5 h-5" />
          </button>

          <h1 className="flex-1 text-center text-[20px] font-semibold">
            {t("readLater.title")}
          </h1>

          <div className="w-5 h-5" />
        </div>

        {/* CONTENT */}
        <div className="bg-white rounded-t-2xl min-h-[93vh] px-4">
          {isEmpty ? (
            <div className="flex min-h-[80vh] items-center justify-center">
              <EmptyReadLater />
            </div>
          ) : (
            <>
              {/* TOP ROW */}
              <div className="flex items-center justify-between py-4">
                <span className="text-md text-gray-500">
                  <span className="text-black">
                    {sortedItems.length}
                  </span>{" "}
                  {t("readLater.title")}
                </span>

                <div className="flex gap-2">
                  {/* FILTER BUTTON */}
                  <button
                    onClick={() => setFilterOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm font-medium"
                  >
                    <ListFilter className="w-4 h-4" />
                    {FILTER_LABELS[filter]}
                  </button>

                  {/* SORT BUTTON */}
                  <SortButton value={sortBy} onChange={setSortBy} />
                </div>
              </div>

              {/* LIST */}
              <div className="pb-6">
                {sortedItems.map((item) => (
                  <NewsletterCard
                    key={item.slug}
                    {...item}
                    onClick={() => { }}
                    isReadLater={true}
                    onMoveToTrash={onMoveToTrash}
                    onToggleReadLater={onToggleReadLater}
                    onToggleFavorite={(emailId: string, isFavorite: boolean) => onToggleFavorite(emailId, isFavorite)}
                    isFavorite={item.isFavorite}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* MOBILE FILTER BOTTOM SHEET */}
        {filterOpen && (
          <div className="fixed inset-0 z-50">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setFilterOpen(false)}
            />

            <div className="absolute bottom-0 w-full rounded-t-2xl bg-white p-6">
              <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-gray-300" />

              {(Object.keys(FILTER_LABELS) as FilterValue[]).map(
                (key) => (
                  <button
                    key={key}
                    onClick={() => {
                      setFilter(key);
                      setFilterOpen(false);
                    }}
                    className="flex w-full items-center justify-between py-3 text-base"
                  >
                    <span>{FILTER_LABELS[key]}</span>

                    <span
                      className={`h-5 w-5 rounded-full border flex items-center justify-center
                        ${filter === key
                          ? "border-[#C95C3A]"
                          : "border-gray-300"
                        }
                      `}
                    >
                      {filter === key && (
                        <span className="h-3 w-3 rounded-full bg-[#C95C3A]" />
                      )}
                    </span>
                  </button>
                )
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ======================================================
     🖥 DESKTOP UI
  ====================================================== */

  return (
    <div className="hidden min-h-[90%] md:flex w-full flex-col gap-8">
      {/* HEADER */}
      <div className="w-full h-[78px] bg-white border border-[#E5E7E8] flex items-center justify-between px-5 shadow-sm">
        <h2 className="text-[26px] font-bold text-[#0C1014]">
          {t("readLater.title")}
        </h2>

        <div className="flex gap-3">
          <FilterButton value={filter} onChange={setFilter} />
          <SortButton value={sortBy} onChange={setSortBy} />
        </div>
      </div>

      {/* CONTENT */}
      <div className="w-full flex-1 flex px-6">
        {isEmpty ? (
          <div className="flex flex-1 items-center justify-center">
            <EmptyReadLater />
          </div>
        ) : (
          <div className="w-full flex flex-col mt-2">
            {sortedItems.slice(0, visible).map((item) => (
              <div key={item.slug} className="mb-3">
                <NewsletterCard
                  {...item}
                  onClick={() => { }}
                  isReadLater={true}
                  onMoveToTrash={onMoveToTrash}
                  onToggleReadLater={onToggleReadLater}
                  onToggleFavorite={(emailId: string, isFavorite: boolean) => onToggleFavorite(emailId, isFavorite)}
                  isFavorite={item.isFavorite}
                />
              </div>
            ))}

            {showMore && <CenterButton onClick={loadMore} />}
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
