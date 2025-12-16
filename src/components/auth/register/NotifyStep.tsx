"use client";

import { useState } from "react";

type Props = {
  onAllow: () => void;
  onSkip: () => void;
};

export default function NotifyStep({ onAllow, onSkip }: Props) {
  const [showOverlay, setShowOverlay] = useState(false);

  const requestPermission = () => {
    // Notifications not supported
    if (typeof window === "undefined" || !("Notification" in window)) {
      onAllow();
      return;
    }

    // Already granted
    if (Notification.permission === "granted") {
      onAllow();
      return;
    }

    // Already denied (browser won't show popup again)
    if (Notification.permission === "denied") {
      onSkip();
      return;
    }

    // Show overlay while system popup is active
    setShowOverlay(true);

    // IMPORTANT: Keep this directly inside click handler
    Notification.requestPermission()
      .then((result) => {
        if (result === "granted") {
          onAllow();
        } else {
          onSkip();
        }
      })
      .catch(() => {
        onSkip();
      })
      .finally(() => {
        setShowOverlay(false);
      });
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* ===== FULLSCREEN BACKGROUND IMAGE ===== */}
      <img
        src="/background/notification-bg.png"
        alt="Notification background"
        className="fixed inset-0 w-full h-[90vdh] object-cover"
      />

      {/* ===== CONDITIONAL GREY OVERLAY ===== */}
      {showOverlay && (
        <div className="fixed inset-0 bg-[#D9D9DB]/90 z-10" />
      )}

      {/* ===== CONTENT ===== */}
      <div className="relative z-20 min-h-screen flex flex-col">
        <div className="flex-1 flex flex-col items-center px-6 pt-10">
          <h1 className="text-[24px] font-semibold text-[#0C1014] text-center mb-12">
            Don’t miss
            <br />
            newsletter updates
          </h1>
        </div>

        {/* ===== BOTTOM CTA ===== */}
        <div className="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-4 z-30">
          <button
            onClick={onSkip}
            className="block w-full text-center text-sm text-[#6F7680] mb-4"
          >
            Skip
          </button>

          <button
            onClick={requestPermission}
            className="w-full py-4 rounded-2xl text-[18px] font-medium bg-[#0C1014] text-white"
          >
            Set Notification
          </button>
        </div>
      </div>
    </div>
  );
}
