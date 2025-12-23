"use client";

import { Flame, Check, ChevronRight } from "lucide-react";
import { useMediaQuery } from "@/hooks/useMediaQuery";

/* ================= Types ================= */
type StreakDay = {
  label: string;
  completed: boolean;
  isToday?: boolean;
};

type DailyStreakData = {
  currentStreak: number;
  days: StreakDay[];
};

/* ================= Mock Data ================= */
const mockDailyStreak: DailyStreakData = {
  currentStreak: 3,
  days: [
    { label: "Sa", completed: true },
    { label: "Mo", completed: true },
    { label: "Tu", completed: true },
    { label: "Th", completed: true },
    { label: "Fr", completed: false, isToday: true },
    { label: "Su", completed: false },
    { label: "Mo", completed: false },
  ],
};

/* ================= Component ================= */
export default function DailyStreakCard({
  onOpen,
  className = "",
}: {
  onOpen: () => void;
  className?: string;
}) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const data = mockDailyStreak;

  return (
    <div
      onClick={onOpen}
      className={`
        w-full h-full bg-white rounded-2xl
        p-4 sm:p-6
        shadow-[0_1px_4px_rgba(0,0,0,0.08)]
        cursor-pointer
        ${className}
      `}
    >
      {/* ================= MOBILE VIEW ================= */}
      {isMobile && (
        <>
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">
              This Week
            </h3>
            <button
              type="button"
              className="text-xs font-medium text-black bg-orange-100 px-4 py-1.5 rounded-full"
            >
              See details
            </button>
          </div>

          {/* Days (NO BACKGROUND) */}
          <div className="px-1">
            <div className="grid grid-cols-7 gap-2 sm:gap-3">
              {data.days.map((day, index) => {
                const isCompleted = day.completed;
                const isToday = day.isToday;

                return (
                  <div
                    key={`${day.label}-${index}`}
                    className="flex flex-col items-center gap-1.5 sm:gap-2"
                  >
                    {/* Indicator */}
                    {isToday && !isCompleted ? (
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center">
                        <Flame
                          size={36}
                          className="text-[#C46A54] sm:hidden"
                          fill="currentColor"
                        />
                      </div>
                    ) : (
                      <div
                        className={`
                          w-9 h-9 sm:w-10 sm:h-10 rounded-full
                          flex items-center justify-center
                          ${
                            isCompleted
                              ? "bg-[#C46A54]"
                              : "border-2 border-gray-300 bg-white"
                          }
                        `}
                      >
                        {isCompleted && (
                          <>
                            <Check size={14} className="text-white sm:hidden" />
                            <Check size={16} className="text-white hidden sm:block" />
                          </>
                        )}
                      </div>
                    )}

                    {/* Label */}
                    <span className="text-xs sm:text-sm font-medium text-gray-900">
                      {day.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* ================= DESKTOP VIEW ================= */}
      {!isMobile && (
        <>
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Daily Streak
            </h3>
            <span className="flex items-center gap-1 text-sm font-medium text-gray-900">
              See all
              <ChevronRight size={16} />
            </span>
          </div>

          {/* Flame + Streak */}
          <div className="flex flex-col items-center mb-6">
            <Flame
              size={40}
              className="text-orange-600 mb-2"
              fill="currentColor"
            />
            <span className="text-2xl font-semibold text-gray-900">
              {data.currentStreak} days streak
            </span>
          </div>

          {/* Days */}
          <div className="bg-gray-100 rounded-xl px-4 py-4">
            <div className="grid grid-cols-7 gap-[clamp(0.2rem,0.6vw,0.5rem)]">
              {data.days.map((day, index) => {
                const isCompleted = day.completed;
                const isToday = day.isToday;

                return (
                  <div
                    key={`${day.label}-${index}`}
                    className="flex flex-col items-center gap-0.5"
                  >
                    {/* Indicator */}
                    {isToday && !isCompleted ? (
                      <div
                        className="
                          flex items-center justify-center
                          rounded-full
                          w-[clamp(22px,3.5vw,36px)]
                          h-[clamp(22px,3.5vw,36px)]
                        "
                      >
                        <Flame
                          className="text-[#C46A54]"
                          fill="currentColor"
                          size={28}
                        />
                      </div>
                    ) : (
                      <div
                        className={`
                          flex items-center justify-center
                          rounded-full
                          w-[clamp(22px,3.5vw,36px)]
                          h-[clamp(22px,3.5vw,36px)]
                          ${
                            isCompleted
                              ? "bg-[#C46A54]"
                              : "border border-gray-300 bg-white"
                          }
                        `}
                      >
                        {isCompleted && (
                          <Check
                            className="text-white"
                            size={12}
                          />
                        )}
                      </div>
                    )}

                    {/* Label */}
                    <span className="text-[clamp(0.6rem,0.9vw,0.75rem)] font-medium text-gray-800">
                      {day.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>



        </>
      )}
    </div>
  );
}
