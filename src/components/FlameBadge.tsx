"use client";

import Image from "next/image";

export default function FlameBadge({ streak = 5 }: { streak?: number }) {
  return (
    <div className="relative flex items-center justify-center w-[28px] h-[28px]">
      {/* Centered streak number */}
      <span className="absolute text-black bottom-[2px] fontFamily: 'Helvetica Neue' font-semibold text-[18px] leading-none">
        {streak}
      </span>

      {/* Flame Icon */}
      <Image
        src="/badges/flame-badge.png"
        alt="Flame Badge"
        width={22}
        height={22}
        className="pointer-events-none select-none"
        // Avoid Next/Image warning when CSS affects only one dimension.
        style={{ width: "auto", height: "auto" }}
      />
    </div>
  );
}
