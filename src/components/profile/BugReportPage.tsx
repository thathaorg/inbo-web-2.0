"use client";

import { ChevronLeft, Image as ImageIcon, Video as VideoIcon } from "lucide-react";
import { useState } from "react";

export default function BugReportPage({ onBack }: { onBack: () => void }) {
  const [bug, setBug] = useState("");

  return (
    <div className="p-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 mb-6 text-black text-sm font-semibold capitalize"
      >
        <ChevronLeft size={18} /> back
      </button>

      {/* Main Card */}
      <div
        className="
          w-full bg-white 
          p-6 rounded-xl 
          shadow-[0_4px_24px_rgba(219,219,219,0.25)]
          border border-[#EEEFF2]
          flex flex-col gap-6
        "
      >
        {/* Title */}
        <h2 className="text-[#0C1014] text-xl font-semibold">
          Report Bug
        </h2>

        {/* Label */}
        <label className="text-[#0C1014] text-base font-medium">
          Description of Bugs
        </label>

        {/* Textarea + Character Counter */}
        <div className="flex flex-col gap-2">
          <textarea
            value={bug}
            onChange={(e) => setBug(e.target.value)}
            maxLength={500}
            placeholder="Describe your bugs..."
            className="
              w-full h-40 
              p-4 rounded-xl 
              border border-[#E2E4E9]
              text-[#0C1014]
              placeholder:text-[#A0A4A9]
              focus:outline-none focus:ring-2 focus:ring-[#C46A54]/30
              resize-none
            "
          />
          <span className="text-sm text-gray-400">{bug.length}/500</span>
        </div>

        {/* Attachments */}
        <div className="flex flex-col gap-3">
          <span className="text-[#0C1014] text-base font-semibold">
            Add Attachments <span className="text-gray-400 font-normal">(Optional)</span>
          </span>

          <div className="flex gap-4">
            {/* Image Button */}
            <button
              className="
                flex flex-col items-center justify-center
                w-24 h-20
                bg-[#F5F5F5]
                rounded-lg
                border border-[#EEEFF2]
                shadow-sm
                text-sm text-[#0C1014]
                gap-1
              "
            >
              <ImageIcon size={22} />
              Image
            </button>

            {/* Video Button */}
            <button
              className="
                flex flex-col items-center justify-center
                w-24 h-20
                bg-[#F5F5F5]
                rounded-lg
                border border-[#EEEFF2]
                shadow-sm
                text-sm text-[#0C1014]
                gap-1
              "
            >
              <VideoIcon size={22} />
              Video
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end mt-4">
          <button
            disabled={!bug.trim()}
            className={`
              px-6 py-3 rounded-full text-base font-semibold transition
              ${
                bug.trim()
                  ? "bg-[#E55E3A] text-white shadow-[0_2px_10px_rgba(229,94,58,0.3)] hover:bg-[#d95735]"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }
            `}
          >
            Submit report
          </button>
        </div>
      </div>
    </div>
  );
}
