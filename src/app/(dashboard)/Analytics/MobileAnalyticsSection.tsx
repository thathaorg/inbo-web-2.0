import ReadingInsightsCard from "@/components/analytics/ReadingInsightsCard";
import MoreLikeYouRead from "@/components/analytics/MoreLikeYouRead";
import InboxSnapshot from "@/components/analytics/InboxSnapshot";
import AchievementsCard from "@/components/analytics/AchievementsCard";

export default function MobileAnalyticsSection({
  onOpenStreak,
  onOpenAchievements,
}: {
  onOpenStreak: () => void;
  onOpenAchievements: () => void;
}) {
  return (
    <div className="flex flex-col gap-6 px-4 pb-8">

      {/* ===== STREAK HERO ===== */}
      <div className="rounded-3xl bg-[#FAD39C] p-6 text-white relative">
        <h2 className="text-5xl font-bold leading-none">0</h2>
        <p className="text-lg mt-1">Streaks Days</p>

        {/* Flame Icon */}
        <div className="absolute right-6 top-6 text-5xl">🔥</div>

        {/* CTA */}
        <div className="bg-white text-gray-700 rounded-2xl p-4 mt-6">
          <p className="text-sm mb-2">
            🎉 Every habit begins with{" "}
            <span className="text-orange-500 font-semibold">Day 1</span>. Start
            when it feels right.
          </p>

          <button
            onClick={onOpenStreak}
            className="text-orange-500 font-semibold"
          >
            Start Reading
          </button>
        </div>
      </div>

      {/* ===== THIS WEEK ===== */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold">This Week</h3>
          <button
            onClick={onOpenStreak}
            className="text-sm bg-orange-100 text-orange-600 px-3 py-1 rounded-full"
          >
            See details
          </button>
        </div>

        <div className="flex justify-between text-sm">
          {["Sa", "Mo", "Tu", "Th", "Fr", "Su", "Mo"].map((day) => (
            <div
              key={day}
              className="w-9 h-9 rounded-full border flex items-center justify-center text-gray-600"
            >
              {day}
            </div>
          ))}
        </div>
      </div>

      {/* ===== MORE LIKE YOU READ ===== */}
      <MoreLikeYouRead />

      {/* ===== INBOX SNAPSHOT ===== */}
      <InboxSnapshot />

      {/* ===== READING INSIGHTS (GRADIENT CARD) ===== */}
      <ReadingInsightsCard />

      {/* ===== ACHIEVEMENTS ===== */}
      <AchievementsCard onOpen={onOpenAchievements} />
    </div>
  );
}
