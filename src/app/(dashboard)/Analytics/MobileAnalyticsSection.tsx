"use client";

import { useRouter } from "next/navigation";
import { MoveLeft, Flame } from "lucide-react";

import ReadingInsightsCard from "@/components/analytics/ReadingInsightsCard";
import MoreLikeYouRead from "@/components/analytics/MoreLikeYouRead";
import AchievementsCard from "@/components/analytics/AchievementsCard";
import DailyStreakCard from "@/components/analytics/DailyStreakCard";

type MobileAnalyticsSectionProps = {
  streakCount?: number;
  onOpenStreak: () => void;
  onOpenAchievements: () => void;
};

export default function MobileAnalyticsSection({
  streakCount=0,
  onOpenStreak,
  onOpenAchievements,
}: MobileAnalyticsSectionProps) {
  const router = useRouter();

  const hasStreak = streakCount > 0;

  return (
    <>
      <style>{`
        .hide-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div className="hide-scrollbar overflow-y-auto">
      {/* ===== HEADER / STREAK CARD ===== */}
      <div
        className={`p-6 mb-4 relative text-white overflow-hidden transition-colors duration-300 ${
          hasStreak ? "bg-[#FF9600]" : "bg-[#FFD7A3]"
        }`}
      >
        {/* Top Header */}
        <div className={`flex items-center justify-center relative mb-6 ${
          hasStreak ? "bg-[#FF9600] text-white" : "bg-[#FFD7A3] text-black"
        }`}>
          {/* Back Button */}
          <button
            onClick={() => router.push("/profile")}
            className="absolute left-0 text-2xl"
            aria-label="Back to profile"
          >
            <MoveLeft />
          </button>

          {/* Title */}
          <h1 className="text-lg font-semibold">Insights</h1>
        </div>

        {/* Streak Info */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-6xl font-bold leading-none">
              {streakCount}
            </h2>
            <p className="text-lg mt-1 opacity-90">Streak Days</p>
          </div>

          {/* Flame Icon */}
          <div className="opacity-90">
            <Flame
              size={80}
              fill={hasStreak ? "#FF9601" : "#E0B37A"}
              stroke={hasStreak ? "#FF9601" : "#E0B37A"}
            />
          </div>
        </div>

        {/* CTA */}
        <div className="bg-white rounded-2xl p-4 mt-6 flex gap-3">
          {/* Icon */}
          <div className="shrink-0">
            <span className="text-xl">🎉</span>
          </div>

          {/* Content */}
          <div className="flex flex-col gap-3 flex-1">
            {/* Message */}
            <p className="text-[18px] leading-6 text-[#6F7680]">
              Every habit begins with{" "}
              <span className="text-orange-500 font-medium">Day 1</span>. Start
              when it feels right.
            </p>

            {/* Action */}
            <button
              onClick={() => router.push("/inbox")}
              className="text-[18px] leading-6 font-medium text-[#C46A54] text-left"
            >
              Start Reading
            </button>
          </div>
        </div>
      </div>

      {/* ===== CONTENT ===== */}
      <div className="flex flex-col gap-6 px-4 pb-8">
        {/* THIS WEEK */}
        <DailyStreakCard
          onOpen={onOpenStreak}
          className="shadow-sm"
        />

        {/* MORE LIKE YOU READ */}
        <MoreLikeYouRead />

        {/* READING INSIGHTS */}
        <ReadingInsightsCard />

        {/* ACHIEVEMENTS */}
        <AchievementsCard onOpen={onOpenAchievements} />
      </div>
      </div>
    </>
  );
}
