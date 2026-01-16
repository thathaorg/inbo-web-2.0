"use client";

import CountBubble from "@/components/inbox/CountBubble";

export type TabType = "unread" | "read" | "all";

export default function TabSwitcher({
  tab,
  setTab,
  unreadCount,
  readCount,
  allCount,
  className = "",
}: {
  tab: TabType;
  setTab: (value: TabType) => void;
  unreadCount: number;
  readCount: number;
  allCount: number;
  className?: string;
}) {
  const items = [
    {
      id: "unread",
      label: (
        <div className="flex items-center gap-2">
          <span>Unread</span>
          <CountBubble count={unreadCount} />
        </div>
      ),
    },
    {
      id: "read",
      label: (
        <div className="flex items-center gap-2">
          <span>Read</span>
          <CountBubble count={readCount} />
        </div>
      ),
    },
    {
      id: "all",
      label: (
        <div className="flex items-center gap-2">
          <span>All</span>
          <CountBubble count={allCount} />
        </div>
      ),
    },
  ];

  return (
    <div
      className={`
        flex items-center bg-[#F6F7F8]
        rounded-full p-1 h-[44px]
        ${className}
      `}
    >
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => setTab(item.id as TabType)}
          className={`
            px-4 h-full flex items-center rounded-full
            text-sm font-medium transition
            ${
              tab === item.id
                ? "bg-white text-[#0C1014] shadow-sm"
                : "text-[#6F7680]"
            }
          `}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
