"use client";

import { useEffect, useState } from "react";
import analyticsService, { InboxSnapshotData } from "@/services/analytics";

export default function InboxOverview() {
  return (
    <div className="relative rounded-3xl bg-white">
      {/* Background wrapper */}
      <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
        <img
          src="/badges/profile-inbo-email-bg.png"
          alt=""
          className="absolute right-0 top-0 h-full object-cover opacity-40 z-30"
        />
      </div>

      {/* Content */}
      <div
        className="
          relative z-10
          grid grid-cols-1 gap-6
          md:grid-cols-[40%_55%] md:gap-8
          min-w-0
        "
      >
        <MoreLikeWhatYouRead />
        <InboxSnapshot />
      </div>
    </div>
  );
}

/* ---------------- More like what you read ---------------- */

function MoreLikeWhatYouRead() {
  // Example dynamic data - kept as placeholder or can be updated later
  const newsletters = Array.from({ length: 17 });

  return (
    <div
      className="
        rounded-2xl
        px-4 pt-5 pb-2
        md:px-6 md:pt-6 md:pb-8
        shadow-sm
        h-full
        bg-white
      "
    >
      <h3 className="text-[18px] md:text-[20px] font-semibold text-[#0C1014] mb-6 md:mb-8">
        More like what you read
      </h3>

      {/* Auto-wrapping grid */}
      <div className="flex justify-center">
        <div
          className="
            flex flex-wrap justify-center
            gap-4 md:gap-5
            max-w-[280px] md:max-w-[360px]
          "
        >
          {newsletters.map((_, i) => (
            <div
              key={i}
              className="
                w-8 h-8
                md:w-10 md:h-10
                rounded-full
                bg-[#FB923C]
                flex items-center justify-center
                overflow-hidden
              "
            >
              <img
                src="/icons/insight-newsletter.png"
                alt="newsletter"
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


/* ---------------- Inbox Snapshot ---------------- */

function InboxSnapshot() {
  const [snapshot, setSnapshot] = useState<InboxSnapshotData | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await analyticsService.getInboxSnapshot();
        setSnapshot(data);
      } catch (e) {
        console.error("Failed to load inbox snapshot", e);
      }
    }
    load();
  }, []);

  const d = snapshot || { received_today: 0, read: 0, unread: 0, read_later: 0, favourite: 0 };

  const inboxData = [
    { label: "Received Today", color: "#FF0033", count: d.received_today },
    { label: "Read", color: "#64C800", count: d.read },
    { label: "Unread", color: "#FFD400", count: d.unread },
    { label: "Read later", color: "#00A6FF", count: d.read_later },
    { label: "Favourite", color: "#F59E0B", count: d.favourite },
  ];

  const total = inboxData.reduce((sum, item) => sum + item.count, 0) || 1; // avoid divide by zero

  return (
    <div className="h-full flex items-center min-w-0 overflow-hidden">
      <div
        className="
          w-full max-w-full min-w-0
          rounded-2xl
          border border-white/30
          backdrop-blur-md
          shadow-md
          px-4 py-2
          md:px-6 md:py-5
          overflow-hidden
        "
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 md:mb-5 min-w-0">
          <h3 className="text-[18px] md:text-[20px] font-semibold text-[#0C1014] truncate">
            Inbox Snapshot
          </h3>

          {/* Desktop only */}
          <span className="hidden md:block text-[14px] text-[#9CA3AF] whitespace-nowrap">
            Hover to see data
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-[20px] md:h-[24px] w-full rounded-full overflow-hidden flex mb-5 md:mb-6">
          {inboxData.map(({ label, color, count }) => {
            const width = (count / total) * 100;

            return (
              <div
                key={label}
                className="group relative h-full flex items-center justify-center shrink-0 transition-all duration-700"
                style={{
                  width: `${width}%`,
                  backgroundColor: color,
                }}
              >
                {/* Always visible on mobile, hover on desktop */}
                <span
                  className="
                    text-[11px] font-semibold text-white
                    md:opacity-0 md:group-hover:opacity-100
                    transition-opacity
                    pointer-events-none
                  "
                >
                  {count > 0 ? count : ''}
                </span>

                {/* Tooltip on hover */}
                <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-[10px] px-2 py-1 rounded hidden md:block z-20">
                  {label}: {count}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-x-5 gap-y-2 md:gap-x-6 md:gap-y-3 text-[13px] md:text-[14px] text-[#111827] min-w-0">
          {inboxData.map(({ label, color, count }) => (
            <div key={label} className="flex items-center gap-2 min-w-0">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: color }}
              />
              <span className="truncate">{label}</span>
              {/* Optional: Show count in legend too just in case bars are small */}
              {/* <span className="text-gray-400 text-xs">({count})</span> */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
