"use client";

import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import MobileHeader from "@/components/layout/MobileHeader";
import NewsletterCard from "@/components/inbox/InboxCard";
import {
  FilterValue,
  FILTER_LABELS,
} from "@/components/FilterButton";
import { ChevronDown, ListFilter } from "lucide-react";
import EmptyInbox from "@/components/inbox/EmptyInbox";
import BottomNav from "@/components/layout/BottomNav";

const INITIAL_VISIBLE_MOBILE = 5;
const LOAD_MORE_MOBILE = 10;

export default function MobileInboxSection({
  tab,
  setTab,
  filteredToday,
  filtered7Days,
  filtered30Days,
  filteredOlder,
  unreadCount,
  readCount,
  allCount,
  hasMorePages,
  loadingMore,
  onRequestMore,
  onMoveToTrash,
  onToggleReadLater,
  onToggleFavorite,
}: {
  tab: string;
  setTab: (t: any) => void;
  filteredToday: any[];
  filtered7Days: any[];
  filtered30Days: any[];
  filteredOlder: any[];
  unreadCount: number;
  readCount: number;
  allCount: number;
  hasMorePages: boolean;
  loadingMore: boolean;
  onRequestMore?: () => void;
  onMoveToTrash?: (emailId: string) => void;
  onToggleReadLater?: (emailId: string, isReadLater: boolean) => void;
  onToggleFavorite?: (emailId: string, isFavorite: boolean) => void;
}) {
  const [visibleToday, setVisibleToday] = useState(INITIAL_VISIBLE_MOBILE);
  const [visible7Days, setVisible7Days] = useState(INITIAL_VISIBLE_MOBILE);
  const [visible30Days, setVisible30Days] = useState(INITIAL_VISIBLE_MOBILE);
  const [visibleOlder, setVisibleOlder] = useState(INITIAL_VISIBLE_MOBILE);

  const [filterOpen, setFilterOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const { t } = useTranslation("common");

  const handleShowMore = (
    visible: number,
    total: number,
    setter: React.Dispatch<React.SetStateAction<number>>
  ) => {
    if (visible < total) {
      setter(v => v + LOAD_MORE_MOBILE);
    } else if (hasMorePages && !loadingMore) {
      onRequestMore?.();
    }
  };

  const allEmpty = filteredToday.length === 0 && filtered7Days.length === 0 && filtered30Days.length === 0 && filteredOlder.length === 0;

  return (
    <div className="w-full md:hidden flex flex-col bg-[#F5F6FA] min-h-screen">
      {/* MOBILE HEADER */}
      <MobileHeader title={t("mobile.yourReads")} onMenuClick={() => { }} />

      {/* MAIN CONTENT */}
      <div
        ref={scrollRef}
        className="flex flex-col bg-white pt-4 rounded-t-3xl flex-1 pb-20 overflow-y-auto"
      >
        {/* FILTER TRIGGER */}
        <div className="flex justify-end px-4 mb-2">
          <button
            onClick={() => setFilterOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#F6F7F8] border border-[#DFE2E6] rounded-full text-sm font-medium"
          >
            <ListFilter className="w-4 h-4" />
            {FILTER_LABELS[tab as FilterValue] || tab}
          </button>
        </div>

        {/* ALL EMPTY */}
        {allEmpty && (
          <div className="flex-1 flex items-center justify-center p-10">
            <EmptyInbox />
          </div>
        )}

        {/* TODAY */}
        {filteredToday.length > 0 && (
          <section className="mb-4">
            <h3 className="text-[14px] font-bold text-gray-400 px-5 mb-3 uppercase tracking-wider">{t("time.today")}</h3>
            {filteredToday.slice(0, visibleToday).map((item, i) => (
              <NewsletterCard
                key={item.slug || i}
                {...item}
                onMoveToTrash={onMoveToTrash}
                onToggleReadLater={onToggleReadLater}
                onToggleFavorite={onToggleFavorite ? () => onToggleFavorite(item.emailId || item.slug, !item.isFavorite) : undefined}
                isFavorite={item.isFavorite}
              />
            ))}
            {(visibleToday < filteredToday.length || (hasMorePages && !loadingMore)) && (
              <button
                onClick={() => handleShowMore(visibleToday, filteredToday.length, setVisibleToday)}
                className="w-full py-4 text-[#D95A33] font-semibold text-sm flex items-center justify-center gap-1 border-t border-gray-50 bg-white"
              >
                {visibleToday < filteredToday.length ? t("mobile.showMore") : t("mobile.loadOlder")} <ChevronDown size={16} />
              </button>
            )}
          </section>
        )}

        {/* LAST 7 DAYS */}
        {filtered7Days.length > 0 && (
          <section className="mb-4">
            <h3 className="text-[14px] font-bold text-gray-400 px-5 mb-3 uppercase tracking-wider">{t("time.last7Days")}</h3>
            {filtered7Days.slice(0, visible7Days).map((item, i) => (
              <NewsletterCard
                key={item.slug || i}
                {...item}
                onMoveToTrash={onMoveToTrash}
                onToggleReadLater={onToggleReadLater}
                onToggleFavorite={onToggleFavorite ? () => onToggleFavorite(item.emailId || item.slug, !item.isFavorite) : undefined}
                isFavorite={item.isFavorite}
              />
            ))}
            {(visible7Days < filtered7Days.length || (hasMorePages && !loadingMore)) && (
              <button
                onClick={() => handleShowMore(visible7Days, filtered7Days.length, setVisible7Days)}
                className="w-full py-4 text-[#D95A33] font-semibold text-sm flex items-center justify-center gap-1 border-t border-gray-50 bg-white"
              >
                {visible7Days < filtered7Days.length ? t("mobile.showMore") : t("mobile.loadOlder")} <ChevronDown size={16} />
              </button>
            )}
          </section>
        )}

        {/* LAST 30 DAYS */}
        {filtered30Days.length > 0 && (
          <section className="mb-4">
            <h3 className="text-[14px] font-bold text-gray-400 px-5 mb-3 uppercase tracking-wider">{t("time.last30Days")}</h3>
            {filtered30Days.slice(0, visible30Days).map((item, i) => (
              <NewsletterCard
                key={item.slug || i}
                {...item}
                onMoveToTrash={onMoveToTrash}
                onToggleReadLater={onToggleReadLater}
                onToggleFavorite={onToggleFavorite ? () => onToggleFavorite(item.emailId || item.slug, !item.isFavorite) : undefined}
                isFavorite={item.isFavorite}
              />
            ))}
            {(visible30Days < filtered30Days.length || (hasMorePages && !loadingMore)) && (
              <button
                onClick={() => handleShowMore(visible30Days, filtered30Days.length, setVisible30Days)}
                className="w-full py-4 text-[#D95A33] font-semibold text-sm flex items-center justify-center gap-1 border-t border-gray-50 bg-white"
              >
                {visible30Days < filtered30Days.length ? t("mobile.showMore") : t("mobile.loadOlder")} <ChevronDown size={16} />
              </button>
            )}
          </section>
        )}

        {/* OLDER */}
        {filteredOlder.length > 0 && (
          <section className="mb-4">
            <h3 className="text-[14px] font-bold text-gray-400 px-5 mb-3 uppercase tracking-wider">{t("time.older")}</h3>
            {filteredOlder.slice(0, visibleOlder).map((item, i) => (
              <NewsletterCard
                key={item.slug || i}
                {...item}
                onMoveToTrash={onMoveToTrash}
                onToggleReadLater={onToggleReadLater}
                onToggleFavorite={onToggleFavorite ? () => onToggleFavorite(item.emailId || item.slug, !item.isFavorite) : undefined}
                isFavorite={item.isFavorite}
              />
            ))}
            {(visibleOlder < filteredOlder.length || (hasMorePages && !loadingMore)) && (
              <button
                onClick={() => handleShowMore(visibleOlder, filteredOlder.length, setVisibleOlder)}
                className="w-full py-4 text-[#D95A33] font-semibold text-sm flex items-center justify-center gap-1 border-t border-gray-50 bg-white"
              >
                {visibleOlder < filteredOlder.length ? t("mobile.showMore") : t("mobile.loadMore")} <ChevronDown size={16} />
              </button>
            )}
          </section>
        )}

        {loadingMore && (
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#D95A33]"></div>
          </div>
        )}
      </div>

      {/* FIXED BOTTOM NAV */}
      <div className="fixed bottom-0 left-0 right-0 p-4 flex justify-center z-50 pointer-events-none">
        <div className="pointer-events-auto">
          <BottomNav />
        </div>
      </div>

      {/* FILTER BOTTOM SHEET */}
      {filterOpen && (
        <div className="fixed inset-0 z-[100]">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setFilterOpen(false)}
          />

          <div className="absolute bottom-0 w-full rounded-t-[32px] bg-white p-8 animate-in slide-in-from-bottom duration-300 shadow-2xl">
            <div className="mx-auto mb-6 h-1.5 w-12 rounded-full bg-gray-200" />

            <h4 className="text-lg font-bold mb-4 px-1">{t("mobile.filterYourReads")}</h4>

            {(Object.keys(FILTER_LABELS) as FilterValue[]).map(key => (
              <button
                key={key}
                onClick={() => {
                  setTab(key);
                  setFilterOpen(false);
                }}
                className="flex w-full items-center justify-between py-5 border-b border-gray-50 last:border-0"
              >
                <div className="flex flex-col items-start">
                  <span className={`text-base font-semibold ${tab === key ? "text-black" : "text-gray-600"}`}>
                    {FILTER_LABELS[key]}
                  </span>
                </div>

                <div
                  className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors ${tab === key
                    ? "border-black bg-black"
                    : "border-gray-200"
                    }`}
                >
                  {tab === key && (
                    <div className="h-2 w-2 rounded-full bg-white" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
