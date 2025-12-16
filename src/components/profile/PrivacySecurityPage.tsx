"use client";

import { ArrowLeft } from "lucide-react";

export default function PrivacySecurityPage({ onBack }: { onBack: () => void }) {
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
          Privacy & Security Info
        </h2>

        {/* Content Text */}
        <p className="text-[#4B5563] text-base font-normal leading-relaxed">
          Your privacy and security are important to us. This section will include 
          all details regarding data usage, permissions, encrypted storage, and 
          account protection.
        </p>
      </div>
    </div>
  );
}
