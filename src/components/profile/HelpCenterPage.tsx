"use client";
import { ArrowLeft, ChevronRight } from "lucide-react";

export default function HelpCenterPage({ onBack }: { onBack: () => void }) {
  const rows = [
    "Help support",
    "Frequently Asked Questions",
  ];

  return (
    <div className="p-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 mb-6 text-black text-sm font-semibold capitalize"
      >
        <ArrowLeft size={18} /> back
      </button>

      {/* Main Card Container */}
      <div
        className="
          w-full bg-white 
          p-4 rounded-xl 
          shadow-[0_4px_24px_rgba(219,219,219,0.25)]
          flex flex-col gap-6
          border border-[#EEEFF2]
        "
      >
        {/* Title */}
        <h2 className="text-[#0C1014] text-xl font-semibold">Help Center</h2>

        {/* Row List */}
        <div className="flex flex-col gap-3">
          {rows.map((item) => (
            <div
              key={item}
              className="
                w-full p-3 bg-white 
                rounded-xl border border-[#EEEFF2]
                shadow-[0_4px_24px_rgba(219,219,219,0.25)]
                flex justify-between items-center
                 hover:bg-gray-50
              "
            >
              {/* Left group: icon + text */}
              <div className="flex items-center gap-3">
                <img
                  src="/icons/help-center-icon.png"
                  alt="help icon"
                  className="w-6 h-6"
                />

                <span className="text-[#0C1014] text-base font-normal">
                  {item}
                </span>
              </div>

              {/* Right arrow */}
              <ChevronRight size={20} strokeWidth={1.5} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
