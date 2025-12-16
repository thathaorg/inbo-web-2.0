"use client";

import {
  Sunrise,
  Train,
  Salad,
  Moon,
} from "lucide-react";

import { useState, useRef, useEffect } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";

/* ================= WHEEL ================= */

function Wheel({
  values,
  value,
  onChange,
}: {
  values: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const ITEM_HEIGHT = 48;
  const PADDING = 3; // MUST match padding count

  const paddedValues = [
    ...Array(PADDING).fill(""),
    ...values,
    ...Array(PADDING).fill(""),
  ];

  /* ---------- scroll to selected value ---------- */
  useEffect(() => {
    if (!ref.current) return;

    const index = values.indexOf(value);
    if (index === -1) return;

    ref.current.scrollTo({
      top: (index + PADDING) * ITEM_HEIGHT,
      behavior: "instant" as ScrollBehavior,
    });
  }, [value, values]);

  /* ---------- handle snapping ---------- */
  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;

    let raf: number | null = null;

    const onScroll = () => {
      if (raf) cancelAnimationFrame(raf);

      raf = requestAnimationFrame(() => {
        const rawIndex =
          Math.round(el.scrollTop / ITEM_HEIGHT) - PADDING;

        const index = Math.max(
          0,
          Math.min(values.length - 1, rawIndex)
        );

        const targetTop = (index + PADDING) * ITEM_HEIGHT;

        // hard snap into place
        el.scrollTo({
          top: targetTop,
          behavior: "smooth",
        });

        onChange(values[index]);
      });
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [values, onChange]);

  return (
    <div className="relative h-[144px] w-[80px] overflow-hidden">
      {/* Selection window */}
      <div className="absolute top-1/2 -translate-y-1/2 h-[48px] w-full border border-black rounded-xl pointer-events-none z-10" />

      <div
        ref={ref}
        className="h-full overflow-y-scroll snap-y snap-mandatory"
        style={{
          scrollbarWidth: "none",
          overscrollBehavior: "contain",
        }}
      >
        {paddedValues.map((v, i) => (
          <div
            key={i}
            className="h-[48px] flex items-center justify-center snap-center text-[22px] font-semibold text-[#0C1014]"
          >
            {v}
          </div>
        ))}
      </div>
    </div>
  );
}




/* ================= MAIN ================= */

export default function ReminderStep({
  reminder,
  setReminder,
  reminderTime,
  setReminderTime,
  onContinue,
  onBack,
}: any) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [showTimeSelect, setShowTimeSelect] = useState(false);

  /* ---------------- TIME STATE (SOURCE OF TRUTH) ---------------- */

  const [hour, setHour] = useState("6");
  const [period, setPeriod] = useState("AM");

  /* ---------------- SYNC reminderTime (SAFE, ONE-WAY) ---------------- */

  useEffect(() => {
    let h = Number(hour);

    if (period === "PM" && h !== 12) h += 12;
    if (period === "AM" && h === 12) h = 0;

    setReminderTime(`${String(h).padStart(2, "0")}:00`);
  }, [hour, period, setReminderTime]);



  /* ---------------- OPTIONS ---------------- */

  const options = [
    { key: "after_waking_up", label: "After waking up", icon: Sunrise, color: "#F97316" },
    { key: "while_commuting", label: "While commuting", icon: Train, color: "#2563EB" },
    { key: "at_lunchtime", label: "At lunchtime", icon: Salad, color: "#16A34A" },
    { key: "before_bedtime", label: "Before bedtime", icon: Moon, color: "#C026D3" },
  ];

  const canContinue = reminder !== "" && reminder !== "none";
  const radius = isMobile ? "rounded-2xl" : "rounded-full";

  /* ---------------- HANDLERS ---------------- */

  const handleContinue = () => {
    if (!canContinue) return;
    setShowTimeSelect(true);
  };

  const handleSkip = () => {
    setReminder("none");
    onContinue();
  };

  /* ---------------- CTA ---------------- */

  const CTAButton = (
    <button
      onClick={showTimeSelect ? onContinue : handleContinue}
      disabled={!canContinue && !showTimeSelect}
      className={`
        w-full py-4 text-[18px] font-medium text-white
        ${radius}
        ${canContinue || showTimeSelect
          ? "bg-[#C46A54]"
          : "bg-[#E5C5BE] opacity-50"}
      `}
    >
      Continue
    </button>
  );

  return (
    <div className="w-full flex flex-col items-center px-4">
      {/* ---------------- TITLE ---------------- */}
      <div className="text-center mt-6 mb-8 max-w-[360px]">
        <h1 className="text-[28px] font-bold leading-[34px] text-[#0C1014]">
          Would you like to get a reading reminder?
        </h1>

        <p className="mt-3 text-[15px] leading-[22px] text-[#6F7680]">
          Having a specific time set apart for reading can help build a habit and
          be more consistent
        </p>
      </div>

      {/* ================= VIEW 1 ================= */}
      {!showTimeSelect && (
        <>
          <div className="w-full max-w-[380px] flex flex-col gap-3">
            {options.map(({ key, label, icon: Icon, color }) => {
              const active = reminder === key;

              return (
                <button
                  key={key}
                  onClick={() => setReminder(key)}
                  className={`
                    flex items-center gap-4 px-5 py-4
                    border transition-all text-[15px]
                    ${radius}
                    ${active
                      ? "bg-[#F6ECE7] border-[#C46A54]"
                      : "bg-[#F5F7F9] border-transparent"}
                  `}
                >
                  <span className="flex items-center justify-center w-8 h-8" style={{ color }}>
                    <Icon size={22} strokeWidth={2} />
                  </span>
                  <span className="text-[#0C1014] font-medium">{label}</span>
                </button>
              );
            })}
          </div>

          {!isMobile && (
            <>
              <div className="mt-10 w-[280px]">{CTAButton}</div>
              <button onClick={onBack} className="mt-4 text-md font-semibold underline">← Back</button>
              <button onClick={handleSkip} className="mt-3 text-sm underline text-[#6F7680]">Skip</button>
            </>
          )}
        </>
      )}

      {/* ================= VIEW 2 ================= */}
      {showTimeSelect && (
        <>
          <div className={`w-full max-w-[380px] bg-white border border-[#E9EAEE] shadow-sm text-center p-8 mb-6 ${radius}`}>
            <h2 className="text-[20px] font-semibold mb-3">Perfect!</h2>

            <p className="text-[14px] text-[#6F7680] mb-8">
              We’ll send you a reminder one hour before your reading.
            </p>

            {/* ================= iOS STYLE TIME ================= */}
            <div className="flex justify-center gap-8">
              <Wheel
                values={["1","2","3","4","5","6","7","8","9","10","11","12"]}
                value={hour}
                onChange={setHour}
              />
              <Wheel
                values={["AM","PM"]}
                value={period}
                onChange={setPeriod}
              />
            </div>

            {/* Selected time */}
            <div className="mt-6 text-[22px] font-semibold text-[#0C1014]">
              {hour}:00 {period}
            </div>
          </div>

          {!isMobile && (
            <>
              <div className="w-[280px]">{CTAButton}</div>
              <button onClick={() => setShowTimeSelect(false)} className="mt-4 underline font-semibold">← Back</button>
              <button onClick={handleSkip} className="mt-3 text-sm underline text-[#6F7680]">Skip</button>
            </>
          )}
        </>
      )}

      {/* ================= MOBILE BOTTOM CTA ================= */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-white px-4 pb-6 pt-4">
          <button onClick={handleSkip} className="block w-full text-center text-sm underline text-[#6F7680] mb-4">
            Skip
          </button>
          {CTAButton}
        </div>
      )}
    </div>
  );
}
