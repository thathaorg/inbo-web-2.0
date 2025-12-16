"use client";

import { ArrowLeft } from "lucide-react";

export default function ContactSupportPage({ onBack }: { onBack: () => void }) {
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
          border border-[#EEEFF2]
          flex flex-col gap-4
        "
      >
        {/* Title */}
        <h2 className="text-[#0C1014] text-xl font-semibold">
          Contact Support
        </h2>

        {/* Description */}
        <p className="text-[#4B5563] text-base font-normal">
          If you are facing issues or need assistance, feel free to reach out.
        </p>

        {/* Updated Email Support Button */}
        <button
          className="
            w-full 
            text-[#CA5E3A] text-base font-semibold
            border border-[#F3B6A3] 
            py-3 rounded-lg 
            bg-[#FFF1EC] hover:bg-[#CA5E3A] hover:text-[white]
          "
        >
          Email Support
        </button>
      </div>
    </div>
  );
}
