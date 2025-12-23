import { createPortal } from "react-dom";
import {
  X,
  Flame,
  Trophy,
  TrendingUp,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useEffect } from "react";

/* =======================
   Types (API-ready)
======================= */

type WeekDay = {
  label: string;
  status: "done" | "today" | "future";
};

type CalendarDay = {
  date: number;
  isStreak: boolean;
  isToday?: boolean;
};

type Props = {
  open: boolean;
  onClose: () => void;
  currentStreak?: number;
  bestStreak?: number;
  week?: WeekDay[];
  calendar?: CalendarDay[];
  monthLabel?: string;
};

/* =======================
   Dummy data
======================= */

const DEFAULT_WEEK: WeekDay[] = [
  { label: "Sa", status: "done" },
  { label: "Mo", status: "done" },
  { label: "Tu", status: "done" },
  { label: "Th", status: "done" },
  { label: "Fr", status: "today" },
  { label: "Su", status: "future" },
  { label: "Mo", status: "future" },
];

const DEFAULT_CALENDAR: CalendarDay[] = Array.from({ length: 35 }, (_, i) => ({
  date: i + 1,
  isStreak: i >= 10 && i <= 16,
  isToday: i === 14,
}));

/* =======================
   Helpers
======================= */

const getStreakSegments = (calendar: CalendarDay[]) => {
  const segments: { row: number; startCol: number; endCol: number }[] = [];

  let i = 0;
  while (i < calendar.length) {
    if (!calendar[i].isStreak) {
      i++;
      continue;
    }

    const start = i;

    while (i < calendar.length && calendar[i].isStreak) {
      i++;
    }

    const end = i - 1;

    let current = start;
    while (current <= end) {
      const row = Math.floor(current / 7);
      const rowEnd = row * 7 + 6;
      const segmentEnd = Math.min(end, rowEnd);

      segments.push({
        row,
        startCol: current % 7,
        endCol: segmentEnd % 7,
      });

      current = segmentEnd + 1;
    }
  }

  return segments;
};


/* =======================
   Component
======================= */

export default function StreakBottomSheet({
  open,
  onClose,
  currentStreak = 10,
  bestStreak = 15,
  week = DEFAULT_WEEK,
  calendar = DEFAULT_CALENDAR,
  monthLabel = "JAN 2022",
}: Props) {
  if (!open) return null;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const streakSegments = getStreakSegments(calendar);

  return createPortal(
    <>
      <style>{`
        .no-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <div className="fixed inset-0 z-[9999]">
        <div className="absolute inset-0 bg-black/30" onClick={onClose} />

        <div
          className="
            fixed bg-white shadow-[0_8px_40px_rgba(0,0,0,0.12)]
            bottom-0 left-0 right-0 h-[90%] rounded-t-3xl pt-5
            md:bottom-5 md:right-5 md:left-auto
            md:h-[85%] md:w-[380px]
            md:rounded-l-2xl md:rounded-tr-none
          "
        >
          <div className="h-full overflow-y-auto px-6 pb-8 no-scrollbar">
            {/* Header */}
            <div className="relative mb-6 flex items-center justify-center">
              <button onClick={onClose} className="absolute left-0">
                <X size={20} />
              </button>
              <h2 className="text-[20px] font-medium">Achievements</h2>
            </div>

            {/* Cards */}
            <div className="mb-6 flex gap-4">
              <div className="flex-1 rounded-[20px] bg-gradient-to-br from-[#FDA635] to-[#FE6709] p-4">
                <div className="mb-6 flex items-center gap-2 text-white">
                  <Flame size={18} />
                  <span className="text-[18px] font-medium">Current</span>
                </div>
                <div className="text-white text-center">
                  <div className="text-[32px] font-bold">{currentStreak}</div>
                  <div>days</div>
                </div>
              </div>

              <div className="flex-1 rounded-[20px] bg-white p-4 shadow">
                <div className="mb-6 flex items-center gap-2 text-[#6F7680]">
                  <Trophy size={18} className="text-[#E59500]" />
                  <span className="text-[18px] font-medium">Best</span>
                </div>
                <div className="text-center">
                  <div className="text-[32px] font-bold">{bestStreak}</div>
                  <div>days</div>
                </div>
              </div>
            </div>

            {/* This Week */}
            <div className="mb-6 rounded-[20px] bg-white p-4 shadow">
              <h3 className="mb-4 text-[20px] font-medium">This Week</h3>

              <div className="flex justify-between mb-4">
                {week.map((d, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <div className="h-10 w-10 flex items-center justify-center">
                      {d.status === "done" && (
                        <div className="h-8 w-8 rounded-full bg-[#C46A54] flex items-center justify-center">
                          <Check size={14} className="text-white" />
                        </div>
                      )}
                      {d.status === "today" && (
                        <Flame size={26} className="text-[#C46A54]" />
                      )}
                      {d.status === "future" && (
                        <div className="h-8 w-8 rounded-full border-2 border-[#A2AAB4]" />
                      )}
                    </div>
                    <span className="text-sm">{d.label}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3 rounded-[12px] bg-[#FFF5EE] p-3 text-[#E59500]">
                <TrendingUp size={18} />
                <span className="font-medium">Keep the momentum going!</span>
                <Flame size={16} fill="currentColor" />
              </div>
            </div>

            {/* Calendar */}
            <div className="rounded-[20px] bg-white p-4 shadow">
              <div className="flex justify-between mb-4 text-sm font-medium">
                <ChevronLeft size={18} />
                <span>{monthLabel}</span>
                <ChevronRight size={18} />
              </div>

              <div className="relative border-t-2 pt-2">
                {streakSegments.map((seg, i) => (
                  <div
                    key={i}
                    className="absolute h-10 rounded-full bg-[#FFF3D6]"
                    style={{
                      top: seg.row * 52 + 6,
                      left: seg.startCol * 44,
                      width: (seg.endCol - seg.startCol+1) * 46 - 8,
                      height:44,
                    }}
                  />
                ))}


                <div className="relative z-10 grid grid-cols-7 gap-3">
                  {calendar.map((day, i) => (
                    <div key={i} className="h-10 w-10 flex items-center justify-center">
                      {day.isStreak ? (
                        <div className="h-8 w-8 rounded-full bg-[#FEC84B] flex items-center justify-center">
                          <Flame size={16} fill="currentColor" className="text-orange-500" />
                        </div>
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-[#EDEFF2]" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
