"use client";

import { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import analyticsService, { Achievement } from "@/services/analytics";

// Default gradient mappings for achievements
const GRADIENT_MAP: Record<string, string> = {
  "first_reader": "from-emerald-400 to-teal-400",
  "rising_star": "from-blue-500 to-indigo-500",
  "streak_master": "from-orange-400 to-red-400",
  "bookworm": "from-purple-400 to-pink-400",
  "default": "from-gray-300 to-gray-400",
};

function getGradient(id: string, providedGradient?: string): string {
  if (providedGradient) return providedGradient;
  return GRADIENT_MAP[id] || GRADIENT_MAP.default;
}

export default function AchievementsCard({
  onOpen,
  className = "",
}: {
  onOpen: () => void;
  className?: string;
}) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const data = await analyticsService.getAchievements();
        setAchievements(data);
      } catch (error) {
        console.error("Failed to fetch achievements:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, []);

  // Show up to 4 achievements, filling with locked placeholders if needed
  const displayAchievements = achievements.slice(0, 4);
  while (displayAchievements.length < 4) {
    displayAchievements.push({
      id: `placeholder-${displayAchievements.length}`,
      title: "Coming Soon",
      status: "locked",
    });
  }

  return (
    <div
      onClick={onOpen}
      className={`
        w-full h-full
        bg-white rounded-2xl
        p-5 sm:p-6
        shadow-[0_1px_4px_rgba(0,0,0,0.08)]
        cursor-pointer
        ${className}
      `}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4 sm:mb-5">
        <h3 className="text-base sm:text-lg font-semibold text-slate-900">
          Achievements
        </h3>
        <span className="flex items-center gap-1 text-sm font-medium text-slate-900 hover:opacity-70 transition">
          See all
          <ChevronRight className="w-4 h-4" />
        </span>
      </div>

      {/* Achievements */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
        {displayAchievements.map((achievement, index) => {
          const isLocked = achievement.status === "locked";
          const gradient = getGradient(achievement.id, achievement.gradient);

          return (
            <div
              key={achievement.id}
              className={`
                bg-[#F3F4F6]
                rounded-xl
                px-2.5 py-3 sm:px-3 sm:py-4
                flex flex-col
                items-center
                gap-1.5 sm:gap-2
                ${index >= 2 ? "hidden md:flex" : "flex"}
              `}
            >
              {/* Badge */}
              <div
                className={`
                  w-12 h-12 sm:w-14 sm:h-14
                  rounded-full
                  flex items-center justify-center
                  ${
                    isLocked
                      ? "bg-gray-200"
                      : `bg-gradient-to-tr ${gradient}`
                  }
                `}
              >
                {isLocked ? (
                  <span className="text-slate-700 text-lg sm:text-xl font-semibold">
                    ?
                  </span>
                ) : (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center">
                    <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 bg-slate-300 rounded-full" />
                  </div>
                )}
              </div>

              {/* Title */}
              <p className="text-xs sm:text-sm font-medium text-slate-900 text-center leading-tight">
                {achievement.title}
              </p>

              {/* Meta */}
              <p className="text-[11px] sm:text-xs text-slate-500 text-center">
                {isLocked ? "Keep reading!" : achievement.date}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
