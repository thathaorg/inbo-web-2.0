"use client";

import { RefreshCw } from "lucide-react";

export default function RefreshButton({
  onClick,
  size = 22,
  className = "",
}: {
  onClick?: () => void;
  size?: number;
  className?: string;
}) {
  return (
    <RefreshCw
      size={size}
      onClick={onClick}
      className={`
        text-[#0C1014] cursor-pointer transition
        active:rotate-90
        ${className}
      `}
    />
  );
}
