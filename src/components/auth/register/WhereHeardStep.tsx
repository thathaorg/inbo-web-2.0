"use client";

import {
  UsersIcon,
  MoreHorizontal,
} from "lucide-react";
import { useEffect, useState } from "react";

/* Same media hook pattern */
function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    const listener = () => setMatches(media.matches);

    listener();
    media.addEventListener("change", listener);

    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}

export default function WhereStep({
  whereHeard,
  setWhereHeard,
  onContinue,
  onBack,
}: any) {
  const isMobile = useMediaQuery("(max-width: 640px)");

  const options = [
    { key: "app_store", label: "App Store", icon: <img src="/icons/apple-store-icon.png" className="h-5 w-5" /> },
    { key: "google", label: "Google Search", icon: <img src="/icons/google-icon.png" className="h-5 w-5" /> },
    {
      key: "social",
      label: "Facebook/Instagram",
      icon: <img src="/icons/instagram-icon.png" className="h-5 w-5" />,
    },
    { key: "friends", label: "Friends/family", icon: <UsersIcon size={18} /> },
    { key: "other", label: "Other", icon: <MoreHorizontal size={18} /> },
  ];

  const canContinue = !!whereHeard;

  /* =========================
     MOBILE SECTION
     ========================= */
  if (isMobile) {
    return (
      <div className="h-full flex flex-col bg-white">

        {/* CONTENT */}
        <div className="flex-1 px-4 pt-6 pb-40">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-[24px] font-bold text-[#0C1014] leading-[30px]">
              Where did you hear<br />about inbo?
            </h1>
          </div>

          {/* Options */}
          <div className="flex flex-col gap-3">
            {options.map((opt) => {
              const active = whereHeard === opt.key;

              return (
                <button
                  key={opt.key}
                  onClick={() => setWhereHeard(opt.key)}
                  className={`
                    flex items-center gap-3 px-5 py-4 rounded-2xl w-full
                    text-[15px] transition-all border
                    ${
                      active
                        ? "bg-[#EAD7CF] border-[#B85A44]"
                        : "bg-[#F5F6F8] border-transparent hover:bg-[#ECECEC]"
                    }
                  `}
                >
                  <span className="text-black">{opt.icon}</span>
                  <span className="text-black">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ================= MOBILE BOTTOM CTA (MATCHES ReminderStep) ================= */}
        <div className="fixed bottom-0 left-0 right-0 bg-white px-4 pb-6 pt-4">
          <button
            onClick={onContinue}
            className="block w-full text-center text-sm underline text-[#6F7680] mb-4"
          >
            Skip
          </button>

          <button
            onClick={onContinue}
            disabled={!canContinue}
            className={`
              w-full py-4 text-[18px] font-medium text-white rounded-2xl
              ${
                canContinue
                  ? "bg-[#C46A54]"
                  : "bg-[#E5C5BE] opacity-50"
              }
            `}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  /* =========================
     DESKTOP SECTION (UNCHANGED)
     ========================= */
  return (
    <div className="w-full flex flex-col items-center justify-center">

      {/* TITLE */}
      <div className="text-center mb-10">
        <h1 className="text-[32px] font-bold text-[#0C1014] leading-[38px]">
          Where did you hear<br />about inbo?
        </h1>
      </div>

      {/* OPTIONS LIST */}
      <div className="flex flex-col gap-3 w-full max-w-[380px]">
        {options.map((opt) => {
          const active = whereHeard === opt.key;

          return (
            <button
              key={opt.key}
              onClick={() => setWhereHeard(opt.key)}
              className={`
                flex items-center gap-3 px-5 py-4 rounded-full w-full
                text-[15px] transition-all border
                ${
                  active
                    ? "bg-[#EAD7CF] border-[#B85A44] md:bg-[#444444] md:border-[#444444]"
                    : "bg-[#F5F6F8] border-transparent hover:bg-[#ECECEC]"
                }
              `}
            >
              <span className={active ? "text-black md:text-white" : "text-black"}>
                {opt.icon}
              </span>

              <span className={active ? "text-black md:text-white" : "text-black"}>
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* CONTINUE BUTTON */}
      <button
        onClick={onContinue}
        disabled={!canContinue}
        className={`
          mt-10 w-full py-4 rounded-full text-[19px] font-medium
          ${
            canContinue
              ? "bg-[#C46A54] text-white"
              : "bg-[#F0F1F3] text-[#A0A4A8] cursor-not-allowed"
          }
        `}
      >
        Continue
      </button>

      {/* BACK */}
      <button
        onClick={onBack}
        className="text-[#0C1014] font-semibold underline text-md mt-4"
      >
        ← Back
      </button>
    </div>
  );
}
