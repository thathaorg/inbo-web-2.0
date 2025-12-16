"use client";

import { ListFilter } from "lucide-react";

export default function FilterButton({
  onClick,
  className = "",
}: {
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-2 py-2
        bg-[#F6F7F8] border border-[#DFE2E6]
        rounded-full sm:rounded-xl
        hover:bg-white transition
        text-sm font-medium
        ${className}
      `}
    >
      <ListFilter size={16} />
      <span className="hidden sm:inline">Filter</span>
    </button>
  );
}
