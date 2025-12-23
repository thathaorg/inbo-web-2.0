import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useEffect } from "react";

/* ======================
   Types (API-ready)
====================== */

type Achievement = {
  id: string;
  title: string;
  date: string;
  variant: "green" | "blue";
};

type Props = {
  open: boolean;
  onClose: () => void;
  achievements?: Achievement[];
};

/* ======================
   Dummy Data
====================== */

const DEFAULT_ACHIEVEMENTS: Achievement[] = Array.from(
  { length: 8 },
  (_, i) => ({
    id: String(i),
    title: "First Reader",
    date: "19 Oct 2025",
    variant: i % 2 === 0 ? "green" : "blue",
  })
);

/* ======================
   Component
====================== */

export default function AchievementsBottomSheet({
  open,
  onClose,
  achievements = DEFAULT_ACHIEVEMENTS,
}: Props) {
  if (!open) return null;

  // Prevent background scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return createPortal(
    <>
      {/* Inline scrollbar-hiding styles */}
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
        {/* Overlay */}
        <div
          className="absolute inset-0 bg-black/40"
          onClick={onClose}
        />

        {/* Panel */}
        <div
          className="
            fixed bg-white
            shadow-[0_8px_40px_rgba(0,0,0,0.12)]
            transition-transform duration-300 ease-out
            pt-5

            /* Mobile (iOS Bottom Sheet) */
            bottom-0 left-0 right-0
            h-[90%] w-full
            rounded-t-3xl

            /* Desktop */
            md:bottom-5 md:right-5 md:left-auto
            md:h-[85%] md:w-[380px]
            md:rounded-l-2xl md:rounded-tr-none
          "
        >
          {/* iOS Drag Handle (mobile only) */}
          <div className="flex justify-center pt-3 pb-2 md:hidden">
            <div className="h-1.5 w-10 rounded-full bg-[#D1D5DB]" />
          </div>

          {/* Scrollable Content */}
          <div className="h-full overflow-y-auto px-6 pb-8 no-scrollbar">
            {/* Header */}
            <div className="relative mb-6 flex items-center justify-center">
              <button
                onClick={onClose}
                className="absolute left-0"
              >
                <X size={20} />
              </button>
              <h2 className="text-[20px] font-medium text-[#0C1014]">
                Achievements
              </h2>
            </div>

            {/* Achievements Grid */}
            <div className="grid grid-cols-2 gap-4">
              {achievements.map((a) => (
                <div
                  key={a.id}
                  className="
                    rounded-[20px]
                    bg-[#F7F7F8]
                    p-4
                    text-center
                    shadow-[0_4px_24px_rgba(197,197,197,0.25)]
                  "
                >
                  {/* Badge */}
                  <div className="mb-3 flex justify-center">
                    <div
                      className={`
                        flex h-14 w-14 items-center justify-center
                        rounded-full
                        ${
                          a.variant === "green"
                            ? "bg-gradient-to-tr from-[#6EE7B7] to-[#34D399]"
                            : "bg-gradient-to-tr from-[#60A5FA] to-[#2563EB]"
                        }
                      `}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
                        {/* Placeholder icon */}
                        <div className="h-4 w-4 rounded-full bg-gray-400" />
                      </div>
                    </div>
                  </div>

                  {/* Text */}
                  <p className="text-[16px] font-medium text-[#0C1014]">
                    {a.title}
                  </p>
                  <p className="mt-1 text-[13px] text-[#6F7680]">
                    {a.date}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
