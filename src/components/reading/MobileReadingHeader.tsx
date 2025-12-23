"use client";

import { ArrowLeft, Sun, StickyNote } from "lucide-react";

export default function MobileReadingHeader({
  title,
  onBack,
}: {
  title: string;
  onBack?: () => void;
}) {
  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-[#F5F5F5]">
      <div className="h-[72px] flex items-center justify-between px-4">
        {/* Left */}
        
          <button onClick={onBack}>
            <ArrowLeft size={24} />
          </button>
          <span className="text-md font-semibold truncate">
            {title}
          </span>
        

        {/* Right pill actions */}
        <div className="flex items-center bg-white rounded-full shadow-sm">
          <button className="px-3 py-3">
            <Sun size={24} />
          </button>
          <button className="px-3 py-3">
            <StickyNote size={24} />
          </button>
        </div>
      </div>
    </header>
  );
}
