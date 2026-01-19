"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import analyticsService from "@/services/analytics";

export default function FlameBadge({ streak: initialStreak }: { streak?: number }) {
  const [streak, setStreak] = useState(initialStreak ?? 0);
  const [loading, setLoading] = useState(initialStreak === undefined);

  useEffect(() => {
    // Only fetch if no initial streak was provided
    if (initialStreak !== undefined) return;

    const fetchStreak = async () => {
      try {
        const data = await analyticsService.getStreakCount();
        setStreak(data.streak_count);
      } catch (error) {
        console.error("Failed to fetch streak:", error);
        setStreak(0);
      } finally {
        setLoading(false);
      }
    };

    fetchStreak();
  }, [initialStreak]);

  return (
    <div className="relative flex items-center justify-center w-[32px] h-[32px]">
      {/* Centered streak number */}
      <span className="absolute text-black bottom-[4px] fontFamily: 'Helvetica Neue' font-semibold text-[18px] leading-none">
        {loading ? "—" : streak}
      </span>

      {/* Flame Icon */}
      <Image
        src="/badges/flame-badge.png"
        alt="Flame Badge"
        width={24}
        height={28}
        className="pointer-events-none select-none"
        // Avoid Next/Image warning when CSS affects only one dimension.
        style={{ width: "24px", height: "28px" }}
      />
    </div>
  );
}
