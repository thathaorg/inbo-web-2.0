"use client";

import { useState } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useRouter } from "next/navigation";
 
import ReadingInsightsCard from "@/components/analytics/ReadingInsightsCard";
import InboxOverview from "@/components/analytics/MoreLikeYouRead";
import DailyStreakCard from "@/components/analytics/DailyStreakCard";
import AchievementsCard from "@/components/analytics/AchievementsCard";
import StreakBottomSheet from "@/components/analytics/StreakBottomSheet";
import AchievementsBottomSheet from "@/components/analytics/AchievementsBottomSheet";
import MobileAnalyticsSection from "./MobileAnalyticsSection";

/* TEMP placeholders — replace later */
import { Star, ChevronUp } from "lucide-react";

export const FavouriteRow = () => (
  <div
    className="
      w-full
      bg-white
      rounded-2xl
      px-6 py-4
      shadow-[0_1px_4px_rgba(0,0,0,0.08)]
      flex items-center justify-between
      cursor-pointer
    "
  >
    {/* Left */}
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-[#FFF4E5] flex items-center justify-center">
        <Star className="w-5 h-5 text-[#F59E0B]" fill="currentColor" />
      </div>
      <span className="text-base font-semibold text-gray-900">
        Favourite
      </span>
    </div>

    {/* Right */}
    <ChevronUp className="w-5 h-5 text-gray-900" />
  </div>
);

export const ReadLaterRow = () => (
  <div
    className="
      w-full
      bg-white
      rounded-2xl
      px-6 py-4
      shadow-[0_1px_4px_rgba(0,0,0,0.08)]
      flex items-center justify-between
      cursor-pointer
    "
  >
    {/* Left */}
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-[#E8F1FF] flex items-center justify-center">
        <img src="/icons/read-later-icon.png" alt="read-later" />
      </div>
      <span className="text-base font-semibold text-gray-900">
        Read Later
      </span>
    </div>

    {/* Right */}
    <ChevronUp className="w-5 h-5 text-gray-900" />
  </div>
);


export default function AnalyticsPage() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const Router=useRouter()
  const [isStreakOpen, setIsStreakOpen] = useState(false);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);

  /* ================= MOBILE RETURN ================= */
  if (isMobile) {
    return (
      <div className="w-full min-h-screen bg-[#F5F6FA]">

        <MobileAnalyticsSection
          onOpenStreak={() => setIsStreakOpen(true)}
          onOpenAchievements={() => setIsAchievementsOpen(true)}
        />

        {/* Mobile Bottom Sheets */}
        <StreakBottomSheet
          open={isStreakOpen}
          onClose={() => setIsStreakOpen(false)}
        />
        <AchievementsBottomSheet
          open={isAchievementsOpen}
          onClose={() => setIsAchievementsOpen(false)}
        />
      </div>
    );
  }

  /* ================= DESKTOP RETURN ================= */
  return (
    <div className="w-full min-h-screen bg-[#F5F6FA]">
      {/* Desktop Header */}
          <div className="w-full">
            <div className="w-full h-[78px] bg-white border border-[#E5E7EB] flex items-center justify-between px-6 shadow-sm">
              <h2 className="text-[26px] font-bold text-[#0C1014]">Analytics</h2>
            </div>
          </div>

      {/* Subtitle BELOW header (styled correctly) */}
      <div className="px-8 pt-3 pb-2">
        <p className="text-[14px] leading-[20px] text-[#6B7280] max-w-[720px]">
          Track your reading – by time, words, and what you’ve read.
        </p>
      </div>

      {/* Desktop Grid */}
      <div className="grid grid-cols-12 gap-x-4 gap-y-6 px-8 pb-6">
        {/* Row 1: Reading Insights */}
        <div className="col-span-12 rounded-2xl overflow-hidden">
          <ReadingInsightsCard />
        </div>

        {/* Row 2: More Like | Inbox Snapshot */}
        <div className="col-span-12">
          <InboxOverview />
        </div>

        {/* Row 3: Favourite | Read Later */}
        <div onClick={()=>{Router.push("/favorite")}} className="col-span-6">
          <FavouriteRow />
        </div>
        <div onClick={()=>{Router.push("/read_later")}} className="col-span-6">
          <ReadLaterRow />
        </div>

        {/* Row 4: Daily Streak | Achievements */}
        <div className="col-span-5 h-full">
          <DailyStreakCard
            onOpen={() => setIsStreakOpen(true)}
            className="h-full"
          />
        </div>
        <div className="col-span-7 h-full">
          <AchievementsCard
            onOpen={() => setIsAchievementsOpen(true)}
            className="h-full"
          />
        </div>

      </div>

      {/* Desktop Bottom Sheets */}
      <StreakBottomSheet
        open={isStreakOpen}
        onClose={() => setIsStreakOpen(false)}
      />
      <AchievementsBottomSheet
        open={isAchievementsOpen}
        onClose={() => setIsAchievementsOpen(false)}
      />
    </div>
  );
}
