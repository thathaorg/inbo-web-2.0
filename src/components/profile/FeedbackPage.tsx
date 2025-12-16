"use client";

import { ArrowLeft } from "lucide-react";
import { useState } from "react";

export default function FeedbackPage({ onBack }: { onBack: () => void }) {
  const [feedback, setFeedback] = useState("");

  return (
    <div className="p-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 mb-6 text-black text-sm font-semibold capitalize"
      >
        <ArrowLeft size={18} /> back
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
          Give Feedback
        </h2>

        {/* Label */}
        <label className="text-[#0C1014] text-base font-medium">
          Description of Feedback
        </label>

        {/* Textarea */}
        <div className="flex flex-col gap-2">
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            maxLength={500}
            placeholder="Describe your feedback..."
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

          {/* Character count */}
          <div className="text-sm text-gray-400">
            {feedback.length}/500
          </div>
        </div>

        {/* Footer: helper text + button */}
        <div className="flex items-center justify-between mt-2">
          {/* Helper text */}
          <p className="text-sm text-gray-400">
            Try to avoid sharing sensitive Information
          </p>

          {/* Send Button (disabled style like screenshot) */}
          <button
            disabled={!feedback.trim()}
            className={`
              px-6 py-3 rounded-full text-base font-semibold transition
              ${
                feedback.trim()
                  ? "bg-[#E55E3A] text-white shadow-[0_2px_10px_rgba(229,94,58,0.3)] hover:bg-[#d95735]"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }
            `}
          >
            Send Feedback
          </button>
        </div>
      </div>
    </div>
  );
}
