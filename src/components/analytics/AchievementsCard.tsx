import { ChevronRight } from "lucide-react";

type AchievementStatus = "earned" | "locked";

interface Achievement {
  id: string;
  title: string;
  date?: string;
  status: AchievementStatus;
  gradient?: string;
}

const DUMMY_ACHIEVEMENTS: Achievement[] = [
  {
    id: "1",
    title: "First Reader",
    date: "19 Oct 2025",
    status: "earned",
    gradient: "from-emerald-400 to-teal-400",
  },
  {
    id: "2",
    title: "First Reader",
    date: "19 Oct 2025",
    status: "earned",
    gradient: "from-blue-500 to-indigo-500",
  },
  {
    id: "3",
    title: "First Reader",
    date: "19 Oct 2025",
    status: "earned",
    gradient: "from-gray-300 to-gray-400",
  },
  {
    id: "4",
    title: "Rising Star",
    status: "locked",
  },
];

export default function AchievementsCard({
  onOpen,
  className = "",
  achievements = DUMMY_ACHIEVEMENTS,
}: {
  onOpen: () => void;
  className?: string;
  achievements?: Achievement[];
}) {
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
        {achievements.map((achievement, index) => {
          const isLocked = achievement.status === "locked";

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
                      : `bg-gradient-to-tr ${achievement.gradient}`
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
                {isLocked ? "Reach level 10" : achievement.date}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
