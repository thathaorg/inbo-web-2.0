"use client";

import { useState } from "react";
import MobileHeader from "@/components/layout/MobileHeader";
import EmptyInbox from "@/components/EmptyInbox";
import InboxCardMobile from "@/components/InboxCard";
import FilterButton from "@/components/FilterButton";
import { ChevronDown } from "lucide-react";

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

  return (
    <div className="w-full md:hidden flex flex-col bg-[#F5F6FA]">

      {/* MOBILE HEADER */}
      <MobileHeader title="Your Reads" onMenuClick={() => {}} />

      {/* MAIN CONTENT */}
      <div className="flex flex-col bg-white pt-4 rounded-t-3xl flex-1 min-h-screen pb-20">

        {/* FILTER BUTTON */}
        <div className="flex justify-end px-4">
          <FilterButton onClick={() => console.log("Filter opened")} />
        </div>

        {/* -------------------------------------- */}
        {/* LAST 24 HOURS */}
        {/* -------------------------------------- */}
        {filtered24.length > 0 && (
          <section>
            <h3 className="text-[15px] font-semibold text-gray-600 mb-3 px-4">
              Last 24 hours
            </h3>

            {filtered24.slice(0, visible24).map((item: any, i: number) => (
              <InboxCardMobile
                key={i}
                {...item}
                title={longTitle}   // ⬅️ use long dummy title
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
        {filtered7.length > 0 && (
          <section className="pb-6 mt-6">
            <h3 className="text-[15px] font-semibold text-gray-600 px-4 mb-3">
              Last 7 days
            </h3>

            {filtered7.slice(0, visible7).map((item: any, i: number) => (
              <InboxCardMobile
                key={i}
                {...item}
                title={longTitle}   // ⬅️ use long dummy title
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

        {/* EMPTY STATE */}
        {filtered24.length === 0 && filtered7.length === 0 && <EmptyInbox />}
      </div>
    </div>
  );
}
