"use client";

import { useState } from "react";
import { useMediaQuery} from "@/hooks/useMediaQuery";

import ReadingInsightsCard from "@/components/analytics/ReadingInsightsCard";
import MoreLikeYouRead from "@/components/analytics/MoreLikeYouRead";
import InboxSnapshot from "@/components/analytics/InboxSnapshot";
import DailyStreakCard from "@/components/analytics/DailyStreakCard";
import AchievementsCard from "@/components/analytics/AchievementsCard";
import StreakBottomSheet from "@/components/analytics/StreakBottomSheet";
import AchievementsBottomSheet from "@/components/analytics/AchievementsBottomSheet";
import MobileAnalyticsSection from "./MobileAnalyticsSection";

/* TEMP placeholders — replace later */
const FavouriteRow = () => (
  <div className="bg-white rounded-2xl p-4 shadow-sm">⭐ Favourite</div>
);
const ReadLaterRow = () => (
  <div className="bg-white rounded-2xl p-4 shadow-sm">📘 Read Later</div>
);

export default function AnalyticsPage() {
  const isMobile = useMediaQuery("(max-width: 1023px)");

  const [isStreakOpen, setIsStreakOpen] = useState(false);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);

  /* ================= MOBILE RETURN ================= */
  if (isMobile) {
    return (
      <div className="w-full min-h-screen bg-[#F5F6FA]">

        {/* Mobile Header */}
        <div className="h-[56px] bg-[#FAD39C] flex items-center justify-center font-semibold text-lg">
          Insights
        </div>

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
      <div className="w-full h-[72px] bg-white border-b border-[#E5E7EB] flex items-center px-8">
        <h2 className="text-[24px] font-semibold text-[#0C1014]">
          Analytics
        </h2>
      </div>

      {/* Desktop Grid */}
      <div className="grid grid-cols-12 gap-x-8 gap-y-8 px-8 py-6">

        {/* Row 1: Reading Insights */}
        <div className="col-span-12 rounded-2xl overflow-hidden">
          <ReadingInsightsCard />
        </div>

        {/* Row 2: More Like | Inbox Snapshot */}
        <div className="col-span-6">
          <MoreLikeYouRead />
        </div>
        <div className="col-span-6">
          <InboxSnapshot />
        </div>

        {/* Row 3: Favourite | Read Later */}
        <div className="col-span-6">
          <FavouriteRow />
        </div>
        <div className="col-span-6">
          <ReadLaterRow />
        </div>

        {/* Row 4: Daily Streak | Achievements */}
        <div className="col-span-6">
          <DailyStreakCard onOpen={() => setIsStreakOpen(true)} />
        </div>
        <div className="col-span-6">
          <AchievementsCard
            onOpen={() => setIsAchievementsOpen(true)}
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
