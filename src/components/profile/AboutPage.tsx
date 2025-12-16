"use client";

import { ArrowLeft } from "lucide-react";

export default function AboutPage({ onBack }: { onBack: () => void }) {
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
          p-6 rounded-xl 
          shadow-[0_4px_24px_rgba(219,219,219,0.25)]
          border border-[#EEEFF2]
          flex flex-col gap-4
        "
      >
        {/* Title */}
        <h2 className="text-[#0C1014] text-xl font-semibold">
          About Inbo
        </h2>

        {/* Content */}
        <p className="text-[#4B5563] text-base leading-relaxed">
          Inbo is a modern newsletter inbox designed to make reading easier,
          cleaner, and more enjoyable. This app helps you manage subscriptions,
          discover new writers, and improve your daily reading workflow.
        </p>
      </div>
    </div>
  );
}
