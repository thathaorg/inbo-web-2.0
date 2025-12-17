"use client";

import { useState } from "react";
import MobileHeader from "@/components/layout/MobileHeader";
import EmptyList from "@/components/inbox/EmptyList";
import InboxCardMobile from "@/components/inbox/InboxCard";
import FilterButton from "@/components/FilterButton";
import { ChevronDown } from "lucide-react";
import EmptyInbox from "@/components/inbox/EmptyInbox";

const INITIAL_VISIBLE = 2;
const LOAD_MORE = 5;

// Long dummy title (4–5 lines)
const longTitle =
  "Breaking insights: Exploring the latest trends and deep-dive analysis shaping today’s digital landscape, uncovering powerful ideas and strategies redefining how creators, founders, and innovators build momentum in a rapidly evolving world.";

export default function MobileInboxSection({
  tab,
  setTab,
  filtered24,
  filtered7,
  unreadCount,
}: any) {
  const [visible24, setVisible24] = useState(INITIAL_VISIBLE);
  const [visible7, setVisible7] = useState(INITIAL_VISIBLE);

  const showMore24 = visible24 < filtered24.length;
  const showMore7 = visible7 < filtered7.length;

  const is24Empty = filtered24.length === 0;
  const is7Empty = filtered7.length === 0;

  // 👉 exactly one list is empty
  const showEmptyList = is24Empty !== is7Empty;

  return (
    <div className="w-full md:hidden flex flex-col bg-[#F5F6FA] min-h-screen">
      {/* MOBILE HEADER */}
      <MobileHeader title="Your Reads" onMenuClick={() => {}} />

      {/* MAIN CONTENT */}
      <div className="flex flex-col bg-white pt-4 rounded-t-3xl flex-1 pb-20">
        {/* FILTER BUTTON */}
        <div className="flex justify-end px-4">
          <FilterButton onClick={() => console.log("Filter opened")} />
        </div>

        {/* -------------------------------------- */}
        {/* BOTH EMPTY → EMPTY INBOX */}
        {/* -------------------------------------- */}
        {is24Empty && is7Empty && (
          <div className="flex-1 flex items-center justify-center">
            <EmptyInbox />
          </div>
        )}

        {/* -------------------------------------- */}
        {/* LAST 24 HOURS */}
        {/* -------------------------------------- */}
        {!is24Empty && (
          <section>
            <h3 className="text-[15px] font-semibold text-gray-600 mb-3 px-4">
              Last 24 hours
            </h3>

            {filtered24.slice(0, visible24).map((item: any, i: number) => (
              <InboxCardMobile
                key={i}
                {...item}
                title={longTitle}
              />
            ))}

            {showMore24 && (
              <button
                onClick={() => setVisible24(prev => prev + LOAD_MORE)}
                className="w-full flex items-center justify-center py-3 mt-2 text-[#D95A33] font-medium text-[15px]"
              >
                Show more <span className="ml-1"><ChevronDown /></span>
              </button>
            )}
          </section>
        )}

        {/* -------------------------------------- */}
        {/* LAST 7 DAYS */}
        {/* -------------------------------------- */}
        {!is7Empty && (
          <section className="pb-6 mt-6">
            <h3 className="text-[15px] font-semibold text-gray-600 px-4 mb-3">
              Last 7 days
            </h3>

            {filtered7.slice(0, visible7).map((item: any, i: number) => (
              <InboxCardMobile
                key={i}
                {...item}
                title={longTitle}
              />
            ))}

            {showMore7 && (
              <button
                onClick={() => setVisible7(prev => prev + LOAD_MORE)}
                className="w-full flex items-center justify-center py-3 mt-2 text-[#D95A33] font-medium text-[15px]"
              >
                Show more <span className="ml-1"><ChevronDown /></span>
              </button>
            )}
          </section>
        )}

        {/* -------------------------------------- */}
        {/* ONE EMPTY → EMPTY LIST AT BOTTOM */}
        {/* -------------------------------------- */}
        {showEmptyList && (
          <div className="mt-6">
            <EmptyList />
          </div>
        )}
      </div>
    </div>
  );
}
